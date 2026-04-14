@description('Deployment environment name.')
param environmentName string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Application name prefix used for Azure resources.')
@minLength(2)
@maxLength(24)
param appName string

@description('Central application domain, such as hris.example.gov.ph. Leave empty to use the Azure default hostname.')
param centralDomain string = ''

@description('Laravel APP_KEY value.')
@secure()
param appKey string

@description('Azure Database for MySQL administrator username.')
param mysqlAdminLogin string

@description('Azure Database for MySQL administrator password.')
@secure()
param mysqlAdminPassword string

@description('App Service plan SKU.')
param appServiceSku string = 'B1'

@description('MySQL Flexible Server SKU name.')
param mysqlSkuName string = 'Standard_B1ms'

@description('MySQL Flexible Server SKU tier.')
param mysqlSkuTier string = 'Burstable'

@description('MySQL version.')
param mysqlVersion string = '8.0.21'

@description('Central database name.')
param centralDatabaseName string = 'lgu_hris_central'

var resourceToken = toLower(uniqueString(subscription().id, resourceGroup().id, environmentName))
var webAppName = take('${appName}-${resourceToken}-web', 60)
var planName = take('${appName}-${resourceToken}-plan', 40)
var insightsName = take('${appName}-${resourceToken}-appi', 60)
var storageAccountName = 'lg${resourceToken}'
var mysqlServerName = take('${appName}-${resourceToken}-mysql', 63)
var effectiveCentralDomain = empty(centralDomain) ? '${webAppName}.azurewebsites.net' : centralDomain

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: null
  }
}

resource servicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  sku: {
    name: appServiceSku
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-12-30' = {
  name: mysqlServerName
  location: location
  sku: {
    name: mysqlSkuName
    tier: mysqlSkuTier
  }
  properties: {
    administratorLogin: mysqlAdminLogin
    administratorLoginPassword: mysqlAdminPassword
    version: mysqlVersion
    availabilityZone: '1'
    createMode: 'Create'
    storage: {
      storageSizeGB: 20
      autoGrow: 'Enabled'
      iops: 360
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource mysqlAllowAzureServices 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-12-30' = {
  parent: mysqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-12-30' = {
  parent: mysqlServer
  name: centralDatabaseName
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: servicePlan.id
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    siteConfig: {
      linuxFxVersion: 'PHP|8.3'
      alwaysOn: false
      minimumElasticInstanceCount: 1
      appCommandLine: 'bash /home/site/wwwroot/azure/startup.sh'
      ftpsState: 'Disabled'
      http20Enabled: true
      minTlsVersion: '1.2'
      use32BitWorkerProcess: false
      appSettings: [
        {
          name: 'APP_NAME'
          value: 'LGU HRIS'
        }
        {
          name: 'APP_ENV'
          value: 'production'
        }
        {
          name: 'APP_DEBUG'
          value: 'false'
        }
        {
          name: 'APP_KEY'
          value: appKey
        }
        {
          name: 'APP_URL'
          value: 'https://${effectiveCentralDomain}'
        }
        {
          name: 'CENTRAL_DOMAIN'
          value: effectiveCentralDomain
        }
        {
          name: 'LOG_CHANNEL'
          value: 'stack'
        }
        {
          name: 'CACHE_STORE'
          value: 'database'
        }
        {
          name: 'SESSION_DRIVER'
          value: 'database'
        }
        {
          name: 'QUEUE_CONNECTION'
          value: 'sync'
        }
        {
          name: 'FILESYSTEM_DISK'
          value: 'local'
        }
        {
          name: 'DB_CONNECTION'
          value: 'mysql'
        }
        {
          name: 'DB_HOST'
          value: '${mysqlServer.name}.mysql.database.azure.com'
        }
        {
          name: 'DB_PORT'
          value: '3306'
        }
        {
          name: 'DB_DATABASE'
          value: centralDatabaseName
        }
        {
          name: 'DB_USERNAME'
          value: mysqlAdminLogin
        }
        {
          name: 'DB_PASSWORD'
          value: mysqlAdminPassword
        }
        {
          name: 'MYSQL_ATTR_SSL_CA'
          value: '/etc/ssl/certs/ca-certificates.crt'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'true'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
  dependsOn: [
    mysqlAllowAzureServices
    mysqlDatabase
  ]
}

output AZURE_LOCATION string = location
output AZURE_WEB_APP_NAME string = webApp.name
output AZURE_WEB_APP_URL string = 'https://${webApp.properties.defaultHostName}'
output AZURE_CENTRAL_DOMAIN string = effectiveCentralDomain
output AZURE_MYSQL_SERVER string = mysqlServer.name
output AZURE_MYSQL_DATABASE string = centralDatabaseName
output AZURE_STORAGE_ACCOUNT string = storage.name
