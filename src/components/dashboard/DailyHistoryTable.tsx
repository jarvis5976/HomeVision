
"use client";

import { useState, useMemo } from "react";
import { DailyHistoryData } from "@/hooks/use-mqtt";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ListChecks, 
  Layers, 
  Percent, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Rows
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DailyHistoryTableProps {
  data: DailyHistoryData | null;
}

export function DailyHistoryTable({ data }: DailyHistoryTableProps) {
  const [isGrouped, setIsGrouped] = useState(false);
  const [isPercentage, setIsPercentage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const currentData = useMemo(() => {
    if (!data) return [];
    return isGrouped 
      ? (isPercentage ? data.group.byPourc : data.group.byKwh)
      : (isPercentage ? data.unGroup.byPourc : data.unGroup.byKwh);
  }, [data, isGrouped, isPercentage]);

  const totalPages = Math.ceil(currentData.length / pageSize);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentData.slice(start, start + pageSize);
  }, [currentData, currentPage, pageSize]);

  if (!data) return null;

  const unit = isPercentage ? "%" : "kWh";

  const renderValue = (val: number | undefined) => {
    if (val === undefined) return `0.00 ${unit}`;
    return `${val.toFixed(2)} ${unit}`;
  };

  const renderRawValue = (val: number | undefined) => {
    if (val === undefined) return "0.00";
    return val.toFixed(2);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (val: string) => {
    setPageSize(parseInt(val));
    setCurrentPage(1);
  };

  // Classe CSS pour harmoniser la largeur des colonnes de données
  const dataColClass = "w-[110px] min-w-[110px] text-center px-2";

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            Historique par jour
          </CardTitle>
          <div className="flex items-center gap-2 ml-4">
            <Rows className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-28 text-[10px] font-bold">
                <SelectValue placeholder="10 lignes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 lignes</SelectItem>
                <SelectItem value="10">10 lignes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
          <Button 
            variant={isGrouped ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => { setIsGrouped(!isGrouped); setCurrentPage(1); }}
            className="h-8 gap-2 text-[10px] font-black uppercase"
          >
            {isGrouped ? <Layers className="w-3.5 h-3.5" /> : <ListChecks className="w-3.5 h-3.5" />}
            {isGrouped ? "Regroupé" : "Détaillé"}
          </Button>
          <div className="w-px h-4 bg-border my-auto" />
          <Button 
            variant={isPercentage ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => { setIsPercentage(!isPercentage); setCurrentPage(1); }}
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
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap w-[60px]">Année</TableHead>
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap w-[100px]">Date</TableHead>
                {!isGrouped && <TableHead className="text-[9px] font-black uppercase whitespace-nowrap w-[80px]">Couleur</TableHead>}
                <TableHead className="text-[9px] font-black uppercase whitespace-nowrap text-center w-[80px]">Heure Soleil</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>SolarEdge</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>APsystems</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Total Prod.</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Achat</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Consommation</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Auto Conso.</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Vente</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Borne</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Maison Cons.</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Annexe Cons.</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Bat. Charge</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Bat. Discharge</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Bat. Total</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Achat Maison</TableHead>
                <TableHead className={cn("text-[9px] font-black uppercase whitespace-nowrap", dataColClass)}>Achat Annexe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, idx) => (
                <TableRow key={idx} className="border-border/50">
                  <TableCell className="text-[10px] font-bold">{row.Année}</TableCell>
                  <TableCell className="text-[10px] font-bold whitespace-nowrap">{row.Date}</TableCell>
                  {!isGrouped && (
                    <TableCell className="text-[10px] font-bold">
                      {row.Couleur || "n/c"}
                    </TableCell>
                  )}
                  <TableCell className="text-[10px] font-bold text-center">{row.SunHours}h</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Production_SolarEdge)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Production_Ecu)}</TableCell>
                  <TableCell className={dataColClass}>
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "text-[10px] font-black",
                        row.Production_Total >= (row.Prevision || 0) ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {renderValue(row.Production_Total)}
                      </span>
                      <span className="text-[8px] text-muted-foreground">{renderRawValue(row.Prevision)}</span>
                    </div>
                  </TableCell>
                  <TableCell className={dataColClass}>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black">{renderValue(row.Achat)}</span>
                      <div className="text-[8px] flex gap-1">
                        <span className="text-emerald-500">{renderRawValue(row.HC)}</span>
                        <span className="opacity-30">/</span>
                        <span className="text-rose-500">{renderRawValue(row.HP)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={dataColClass}>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black">{renderValue(row.Consommation)}</span>
                      <span className="text-[8px] text-emerald-500 font-bold">{renderRawValue(row.Consommation - (row.Borne || 0))}</span>
                    </div>
                  </TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Autoconsommation)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Vente)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Borne)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.ConsommationMaison)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.ConsommationAnnexe)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.BatteryCharge)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.BatteryDischarge)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.BatteryTotal)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.AchatMaison)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.AchatAnnexe)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t border-border/50 py-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Page {currentPage} sur {totalPages} ({currentData.length} lignes au total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
