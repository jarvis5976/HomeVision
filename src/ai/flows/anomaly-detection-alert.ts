'use server';
/**
 * @fileOverview This file implements a Genkit flow for detecting anomalies in home sensor data.
 *
 * - anomalyDetectionAlert - A function that handles the anomaly detection process.
 * - AnomalyDetectionAlertInput - The input type for the anomalyDetectionAlert function.
 * - AnomalyDetectionAlertOutput - The return type for the anomalyDetectionAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SensorReadingSchema = z.object({
  sensorId: z.string().describe('Unique identifier for the sensor.'),
  type: z.string().describe('The type of sensor (e.g., "temperature", "humidity", "energy_consumption").'),
  value: z.number().describe('The current reading of the sensor.'),
  timestamp: z.string().datetime().describe('The timestamp of the reading in ISO 8601 format.'),
});

const AnomalyDetectionAlertInputSchema = z.object({
  sensorReadings: z.array(SensorReadingSchema).describe('An array of recent sensor readings to analyze.'),
  context: z.string().optional().describe('Any additional context that might help in anomaly detection, e.g., location or expected ranges.'),
});
export type AnomalyDetectionAlertInput = z.infer<typeof AnomalyDetectionAlertInputSchema>;

const AnomalyDetectionAlertOutputSchema = z.object({
  anomalyDetected: z.boolean().describe('True if an anomaly was detected, false otherwise.'),
  explanation: z.string().describe('A concise AI-generated explanation of the detected anomaly, or a statement that no anomaly was found.'),
  severity: z.enum(['low', 'medium', 'high']).optional().describe('The severity of the anomaly, if detected.'),
});
export type AnomalyDetectionAlertOutput = z.infer<typeof AnomalyDetectionAlertOutputSchema>;

export async function anomalyDetectionAlert(input: AnomalyDetectionAlertInput): Promise<AnomalyDetectionAlertOutput> {
  return anomalyDetectionAlertFlow(input);
}

const anomalyDetectionPrompt = ai.definePrompt({
  name: 'anomalyDetectionPrompt',
  input: { schema: AnomalyDetectionAlertInputSchema },
  output: { schema: AnomalyDetectionAlertOutputSchema },
  prompt: `You are an intelligent anomaly detection system for home sensor data. Your task is to analyze the provided sensor readings and identify any significant anomalies based on unusual patterns, sudden spikes, or deviations from expected norms.

Here are the sensor readings to analyze:
{{#each sensorReadings}}
- Sensor ID: {{{sensorId}}}, Type: {{{type}}}, Value: {{{value}}}, Timestamp: {{{timestamp}}}
{{/each}}

{{#if context}}
Additional context: {{{context}}}
{{/if}}

Determine if an anomaly is detected. If an anomaly is present, provide a concise explanation covering what the anomaly is, why it's unusual, its potential implications, and assign a severity level (low, medium, or high). If no anomaly is detected, set 'anomalyDetected' to false and provide a brief statement confirming no anomalies were found.

Remember to respond strictly in JSON format as per the output schema provided.`,
});

const anomalyDetectionAlertFlow = ai.defineFlow(
  {
    name: 'anomalyDetectionAlertFlow',
    inputSchema: AnomalyDetectionAlertInputSchema,
    outputSchema: AnomalyDetectionAlertOutputSchema,
  },
  async (input) => {
    const { output } = await anomalyDetectionPrompt(input);
    return output!;
  }
);
