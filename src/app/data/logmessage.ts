export type Severity = 'debug' | 'info' | 'warning' | 'error';

export type Logmessage = {
  module: string;
  severity: Severity;
  message: string;
  timestamp: Date;
};
