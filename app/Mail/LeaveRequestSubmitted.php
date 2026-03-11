<?php

namespace App\Mail;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeaveRequestSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly LeaveRequest $leaveRequest) {}

    public function envelope(): Envelope
    {
        $employee = $this->leaveRequest->employee;

        return new Envelope(
            subject: "Leave Request Filed \u2013 {$employee->last_name}, {$employee->first_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.leave.submitted',
        );
    }
}
