"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Mail, ShieldAlert, FileText, Globe, Server } from "lucide-react";
import { ProofpointMessageEvent, MessagePart, ThreatInfo } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MessageEventCardProps {
  event: ProofpointMessageEvent;
}

const KeyValue = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col py-1 min-w-0">
    <span className="text-xs font-medium text-muted-foreground truncate" title={label}>{label}</span>
    <span className="text-sm font-medium break-words break-all">{value !== undefined && value !== null && value !== "" ? value : "N/A"}</span>
  </div>
);

const FormattedDate = ({ dateString }: { dateString: string }) => {
  try {
    const date = new Date(dateString);
    return <span>{format(date, "PPpp")}</span>;
  } catch (e) {
    return <span>{dateString}</span>;
  }
};

export function MessageEventCard({ event }: MessageEventCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to determine if there are any threats
  const hasThreats = event.threatsInfoMap && event.threatsInfoMap.length > 0;

  return (
    <Card className={`w-full transition-all duration-200 ${isOpen ? "ring-2 ring-primary/20" : "hover:border-primary/50"}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer">
            <CardHeader className="p-4 sm:p-6 pb-4 flex flex-row items-start justify-between space-y-0 group">
              <div className="flex flex-col space-y-2 w-full pr-4 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full min-w-0 gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-base truncate" title={event.subject || "No Subject"}>
                      {event.subject || "No Subject"}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FormattedDate dateString={event.messageTime} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium">Sender</span>
                    <span className="truncate" title={event.sender}>{event.sender}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium">Recipient</span>
                    <span className="truncate" title={event.recipient?.join(", ")}>{event.recipient?.join(", ") || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  {hasThreats ? (
                    <Badge variant="destructive" className="flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>{event.threatsInfoMap.length} Threat(s)</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                      Clean
                    </Badge>
                  )}
                  {event.spamScore > 50 && <Badge variant="secondary">Spam Score: {event.spamScore}</Badge>}
                  {event.phishScore > 50 && <Badge variant="secondary">Phish Score: {event.phishScore}</Badge>}
                </div>
              </div>
              
              <div className="pt-1 bg-secondary/50 p-1.5 rounded-md text-muted-foreground group-hover:text-foreground transition-colors">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <CardContent className="p-4 sm:p-6 space-y-6 pt-6">
            
            {/* Core Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center space-x-2 uppercase tracking-wider text-muted-foreground">
                <Mail className="w-4 h-4" /> <span>Message Details</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-lg">
                <KeyValue label="Message ID" value={event.messageID} />
                <KeyValue label="GUID" value={event.GUID} />
                <KeyValue label="Header From" value={event.headerFrom} />
                <KeyValue label="From Address" value={event.fromAddress} />
                <KeyValue label="Reply-To" value={event.replyToAddress} />
                <KeyValue label="To Addresses" value={event.toAddresses?.join(", ")} />
                <KeyValue label="Message Size" value={`${(event.messageSize / 1024).toFixed(2)} KB`} />
                <KeyValue label="X-Mailer" value={event.xmailer} />
                <KeyValue label="Completely Rewritten" value={event.completelyRewritten} />
                <KeyValue label="Quarantine Rule" value={event.quarantineRule} />
              </div>
            </div>

            {/* Scores & Security */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center space-x-2 uppercase tracking-wider text-muted-foreground">
                <ShieldAlert className="w-4 h-4" /> <span>Security & Scores</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-lg">
                <KeyValue label="Spam Score" value={event.spamScore} />
                <KeyValue label="Phish Score" value={event.phishScore} />
                <KeyValue label="Malware Score" value={event.malwareScore} />
                <KeyValue label="Impostor Score" value={event.impostorScore} />
              </div>
            </div>

            {/* Network & Organization */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center space-x-2 uppercase tracking-wider text-muted-foreground">
                <Globe className="w-4 h-4" /> <span>Network & Organization</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-lg">
                <KeyValue label="Sender IP" value={event.senderIP} />
                <KeyValue label="Customer Name" value={event.customerName} />
                <KeyValue label="Customer EID" value={event.customerEid} />
                <KeyValue label="Parent Name" value={event.parentName} />
                <KeyValue label="Parent EID" value={event.parentEid} />
                <KeyValue label="Stack Name" value={event.stackName} />
              </div>
            </div>

            {/* Threat Info Map (Collapsible) */}
            {hasThreats && (
              <div className="space-y-3 pt-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md cursor-pointer hover:bg-destructive/20 transition-colors">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-destructive" />
                        <span className="font-semibold text-sm text-destructive">Threats Information ({event.threatsInfoMap.length})</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-destructive" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 space-y-2">
                    {event.threatsInfoMap.map((threat, index) => (
                      <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-secondary/10 border rounded-md text-sm">
                        <KeyValue label="Threat" value={threat.threat} />
                        <KeyValue label="Classification" value={threat.classification} />
                        <KeyValue label="Type" value={threat.threatType} />
                        <KeyValue label="Status" value={threat.threatStatus} />
                        <KeyValue label="Threat ID" value={threat.threatId} />
                        <KeyValue label="Threat Time" value={<FormattedDate dateString={threat.threatTime} />} />
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Message Parts (Collapsible) */}
            {event.messageParts && event.messageParts.length > 0 && (
              <div className="space-y-3 pt-2">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 border rounded-md cursor-pointer hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">Message Parts ({event.messageParts.length})</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 space-y-2">
                    {event.messageParts.map((part, index) => (
                      <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-background border rounded-md text-sm">
                        <KeyValue label="Filename" value={part.filename} />
                        <KeyValue label="Content Type" value={part.contentType} />
                        <KeyValue label="Orig Content Type" value={part.oContentType} />
                        <KeyValue label="Disposition" value={part.disposition} />
                        <KeyValue label="Sandbox Status" value={part.sandboxStatus} />
                        <KeyValue label="MD5" value={part.md5} />
                        <div className="col-span-2 md:col-span-3 min-w-0">
                          <KeyValue label="SHA256" value={part.sha256} />
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
