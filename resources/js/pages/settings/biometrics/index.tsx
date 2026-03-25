import { Head, useForm } from '@inertiajs/react';
import {
    Activity,
    Cpu,
    Edit2,
    MapPin,
    Plus,
    RefreshCw,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Device = {
    id: number;
    name: string;
    brand: string;
    serial_number: string;
    ip_address: string | null;
    protocol: string;
    location: string | null;
    is_active: boolean;
    last_sync_at: string;
};

type Props = {
    devices: Device[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '#' },
    { title: 'Biometric Devices', href: '/settings/biometrics' },
];

export default function BiometricsIndex({ devices }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        brand: 'zkteco',
        serial_number: '',
        ip_address: '',
        port: 4370,
        protocol: 'push',
        location: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDevice) {
            put(`/settings/biometrics/${editingDevice.id}`, {
                onSuccess: () => {
                    setEditingDevice(null);
                    reset();
                },
            });
        } else {
            post('/settings/biometrics', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (device: Device) => {
        setEditingDevice(device);
        setData({
            name: device.name,
            brand: device.brand.toLowerCase(),
            serial_number: device.serial_number,
            ip_address: device.ip_address || '',
            port: device.brand.toLowerCase() === 'zkteco' ? 4370 : 8000,
            protocol: device.protocol.toLowerCase(),
            location: device.location || '',
            is_active: device.is_active,
        });
    };

    const confirmDelete = (device: Device) => {
        if (confirm(`Are you sure you want to delete ${device.name}?`)) {
            destroy(`/settings/biometrics/${device.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Biometric Devices" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Biometric Devices</h1>
                        <p className="text-muted-foreground">Manage your hardware integrations and real-time attendance syncing.</p>
                    </div>
                    <Button onClick={() => { reset(); setIsAddModalOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Device
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Terminals</CardTitle>
                        <CardDescription>
                            All registered fingerprint and facial recognition devices currently connected to the HRIS.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device Name</TableHead>
                                    <TableHead>Brand / Model</TableHead>
                                    <TableHead>Connection</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Sync</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No devices found. Add your first biometric terminal to start syncing.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    devices.map((device) => (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Cpu className="h-4 w-4 text-muted-foreground" />
                                                    {device.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{device.brand}</span>
                                                    <span className="text-xs text-muted-foreground">SN: {device.serial_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Badge variant="outline" className="w-fit">
                                                        {device.protocol}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground mt-1">{device.ip_address || 'Cloud/Push'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    {device.location || 'Not set'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={device.is_active ? 'default' : 'secondary'}>
                                                    {device.is_active ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <RefreshCw className="h-3 w-3 text-muted-foreground" />
                                                    {device.last_sync_at}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(device)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete(device)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Real-time Status</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Online</div>
                            <p className="text-xs text-muted-foreground">Push service is listening for incoming logs.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Synced Scans</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{devices.length > 0 ? 'Ready' : 'Pending'}</div>
                            <p className="text-xs text-muted-foreground">Security-verified hardware active.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isAddModalOpen || !!editingDevice} onOpenChange={(open) => { if (!open) { setIsAddModalOpen(false); setEditingDevice(null); } }}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingDevice ? 'Edit Device' : 'Add New Biometric Device'}</DialogTitle>
                            <DialogDescription>
                                Configure the terminal details to enable automatic attendance syncing.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} className="col-span-3" placeholder="e.g. Main Lobby Terminal" required />
                                {errors.name && <p className="col-start-2 col-span-3 text-xs text-destructive">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="brand" className="text-right">Brand</Label>
                                <Select value={data.brand} onValueChange={val => setData('brand', val)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="zkteco">ZKTeco</SelectItem>
                                        <SelectItem value="hikvision">Hikvision</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sn" className="text-right">Serial No.</Label>
                                <Input id="sn" value={data.serial_number} onChange={e => setData('serial_number', e.target.value)} className="col-span-3" placeholder="Found on device sticker" required />
                                {errors.serial_number && <p className="col-start-2 col-span-3 text-xs text-destructive">{errors.serial_number}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="protocol" className="text-right">Protocol</Label>
                                <Select value={data.protocol} onValueChange={val => setData('protocol', val)}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select protocol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="push">Real-time Push (ADMS/Cloud)</SelectItem>
                                        <SelectItem value="poll">TCP/IP Polling (Local Network)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {data.protocol === 'poll' && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="ip" className="text-right">IP Address</Label>
                                        <Input id="ip" value={data.ip_address} onChange={e => setData('ip_address', e.target.value)} className="col-span-3" placeholder="192.168.1.100" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="port" className="text-right">Port</Label>
                                        <Input id="port" type="number" value={data.port} onChange={e => setData('port', parseInt(e.target.value))} className="col-span-3" required />
                                    </div>
                                </>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">Location</Label>
                                <Input id="location" value={data.location} onChange={e => setData('location', e.target.value)} className="col-span-3" placeholder="e.g. 1st Floor Entrance" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingDevice(null); }}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{editingDevice ? 'Update Device' : 'Register Device'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
