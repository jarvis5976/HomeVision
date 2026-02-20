
"use client";

import { useState, useEffect } from "react";
import { useMQTT } from "@/hooks/use-mqtt";
import { anomalyDetectionAlert, AnomalyDetectionAlertOutput } from "@/ai/flows/anomaly-detection-alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function AnomalyAlerter() {
  const { messages } = useMQTT();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AnomalyDetectionAlertOutput | null>(null);

  useEffect(() => {
    // Run anomaly detection periodically or when enough new messages arrive
    if (messages.length > 0 && messages.length % 5 === 0) {
      handleAnalyze();
    }
  }, [messages.length]);

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Map MQTT messages to the format expected by the Genkit flow
      const readings = messages.slice(0, 10).map((m, i) => ({
        sensorId: m.topic,
        type: m.topic.includes('temp') ? 'temperature' : m.topic.includes('humidity') ? 'humidity' : 'generic',
        value: parseFloat(m.message) || 0,
        timestamp: m.timestamp.toISOString()
      }));

      const result = await anomalyDetectionAlert({
        sensorReadings: readings,
        context: "Home sensors monitoring environmental data."
      });
      setLastResult(result);
    } catch (error) {
      console.error("Anomaly Detection Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          AI Anomaly Engine
        </CardTitle>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </CardHeader>
      <CardContent className="space-y-4">
        {!lastResult && !loading && (
          <div className="text-center py-6">
            <ShieldCheck className="w-8 h-8 text-accent mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">Monitoring active. Awaiting data analysis...</p>
          </div>
        )}

        {lastResult && (
          <div className="space-y-3">
            {lastResult.anomalyDetected ? (
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex justify-between">
                  <span>Potential Anomaly</span>
                  <Badge variant="destructive" className="capitalize text-[10px]">{lastResult.severity}</Badge>
                </AlertTitle>
                <AlertDescription className="text-xs mt-2 leading-relaxed">
                  {lastResult.explanation}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-accent-foreground uppercase tracking-tight">System Status: Stable</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">{lastResult.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
