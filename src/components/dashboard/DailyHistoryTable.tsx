
"use client";

import { useState } from "react";
import { DailyHistoryData, DailyHistoryItem } from "@/hooks/use-mqtt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ListChecks, Layers, Percent, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyHistoryTableProps {
  data: DailyHistoryData | null;
}

export function DailyHistoryTable({ data }: DailyHistoryTableProps) {
  const [isGrouped, setIsGrouped] = useState(false);
  const [isPercentage, setIsPercentage] = useState(false);

  if (!data) return null;

  const currentData = isGrouped 
    ? (isPercentage ? data.group.byPourc : data.group.byKwh)
    : (isPercentage ? data.unGroup.byPourc : data.unGroup.byKwh);

  const unit = isPercentage ? "%" : "kWh";

  const renderValue = (val: number | undefined) => {
    if (val === undefined) return "0.00";
    return val.toFixed(2);
  };

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-primary" />
          Historique par jour
        </CardTitle>
        <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
          <Button 
            variant={isGrouped ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setIsGrouped(!isGrouped)}
            className="h-8 gap-2 text-[10px] font-black uppercase"
          >
            {isGrouped ? <Layers className="w-3.5 h-3.5" /> : <ListChecks className="w-3.5 h-3.5" />}
            {isGrouped ? "Regroupé" : "Détaillé"}
          </Button>
          <div className="w-px h-4 bg-border my-auto" />
          <Button 
            variant={isPercentage ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setIsPercentage(!isPercentage)}
            className="h-8 gap-2 text-[10px] font-black uppercase"
          >
            {isPercentage ? <Percent className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            {isPercentage ? "%" : "kWh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Année</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Date</TableHead>
                {!isGrouped && <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Couleur</TableHead>}
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Heure Soleil</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">SolarEdge</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">APsystems</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Total Prod.</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Achat</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Consommation</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Auto Conso.</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Vente</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Borne</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Maison Cons.</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Annexe Cons.</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Bat. Charge</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Bat. Discharge</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Bat. Total</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Achat Maison</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap">Achat Annexe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, idx) => (
                <TableRow key={idx} className="border-border/50">
                  <TableCell className="text-[10px] font-bold">{row.Année}</TableCell>
                  <TableCell className="text-[10px] font-bold whitespace-nowrap">{row.Date}</TableCell>
                  {!isGrouped && (
                    <TableCell className="text-[10px] font-bold">
                      {row.Couleur || "n/c"}
                    </TableCell>
                  )}
                  <TableCell className="text-[10px] font-bold">{row.SunHours}h</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.Production_SolarEdge)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.Production_Ecu)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-[10px] font-black",
                        row.Production_Total >= (row.Prevision || 0) ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {renderValue(row.Production_Total)}
                      </span>
                      <span className="text-[8px] text-muted-foreground">Prév: {renderValue(row.Prevision)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black">{renderValue(row.Achat)}</span>
                      <div className="text-[8px] flex gap-1">
                        <span className="text-emerald-500">{renderValue(row.HC)}</span>
                        <span className="opacity-30">/</span>
                        <span className="text-rose-500">{renderValue(row.HP)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black">{renderValue(row.Consommation)}</span>
                      <span className="text-[8px] text-emerald-500">Net: {renderValue(row.Consommation - (row.Borne || 0))}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.Autoconsommation)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.Vente)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.Borne)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.ConsommationMaison)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.ConsommationAnnexe)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.BatteryCharge)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.BatteryDischarge)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.BatteryTotal)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.AchatMaison)}</TableCell>
                  <TableCell className="text-[10px] font-bold">{renderValue(row.AchatAnnexe)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
