
export type Severity = 'info' | 'warning' | 'error';

export type Logmessage = {
    module: string;
    severity: Severity
    message: string;
    timestamp: Date;
};
