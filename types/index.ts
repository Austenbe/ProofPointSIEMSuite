export interface MessagePart {
  contentType: string;
  disposition: string;
  filename: string;
  md5: string;
  oContentType: string;
  sandboxStatus: string;
  sha256: string;
}

export interface ThreatInfo {
  classification: string;
  threat: string;
  threatId: string;
  threatStatus: string;
  threatTime: string;
  threatType: string;
}

export interface ProofpointMessageEvent {
  GUID: string;
  completelyRewritten: string;
  customerEid: string;
  customerName: string;
  fromAddress: string;
  headerFrom: string;
  impostorScore: number;
  malwareScore: number;
  messageDetailsUrl: string;
  messageID: string;
  messageParts: MessagePart[];
  messageSize: number;
  messageTime: string;
  parentEid: string;
  parentName: string;
  phishScore: number;
  quarantineRule: string;
  recipient: string[];
  replyToAddress: string;
  sender: string;
  senderIP: string;
  spamScore: number;
  stackName: string;
  subject: string;
  threatsInfoMap: ThreatInfo[];
  toAddresses: string[];
  xmailer: string;
}

export interface StatsData {
  eid: number;
  name: string;
  organization_hierarchy: string[];
  active_users: number;
  ib_total: number;
  ob_total: number;
  ib_blocked: number;
  ob_blocked: number;
  ib_spam: number;
  ib_virus: number;
  ib_mal_att: number;
  ib_imposter: number;
  ib_phish: number;
  ob_enc: number;
}

export interface StatsResponse {
  current_page: number;
  data: StatsData[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
