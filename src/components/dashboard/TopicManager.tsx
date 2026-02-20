
"use client";

import { useState } from "react";
import { useMQTT } from "@/hooks/use-mqtt";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Hash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TopicManager() {
  const { topics, addTopic, removeTopic } = useMQTT();
  const [newTopic, setNewTopic] = useState("");

  const handleAdd = () => {
    if (newTopic.trim()) {
      addTopic(newTopic.trim());
      setNewTopic("");
    }
  };

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          Topic Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="e.g. home/sensors/+" 
            value={newTopic} 
            onChange={(e) => setNewTopic(e.target.value)}
            className="text-sm"
          />
          <Button size="icon" variant="secondary" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map(topic => (
            <Badge key={topic} variant="secondary" className="flex items-center gap-1.5 py-1 px-2 pr-1">
              {topic}
              <button 
                onClick={() => removeTopic(topic)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
