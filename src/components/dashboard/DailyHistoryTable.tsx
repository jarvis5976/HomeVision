"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { DailyHistoryData } from "@/hooks/use-mqtt";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ListChecks, 
  Layers, 
  Percent, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Rows,
  CalendarDays,
  FilterX,
  Calendar as CalendarIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayPicker, DateRange } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { format, startOfDay, parseISO, isValid } from "date-fns";
import { fr as frDateFns } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Import du style par défaut de react-day-picker
import "react-day-picker/dist/style.css";

interface DailyHistoryTableProps {
  data: DailyHistoryData | null;
}

const MONTH_MAP: Record<string, number> = {
  "janvier": 0, "février": 1, "mars": 2, "avril": 3, "mai": 4, "juin": 5,
  "juillet": 6, "août": 7, "septembre": 8, "octobre": 9, "novembre": 10, "décembre": 11
};

export function DailyHistoryTable({ data }: DailyHistoryTableProps) {
  const [isGrouped, setIsGrouped] = useState(false);
  const [isPercentage, setIsPercentage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fermer si clic extérieur (logique personnalisée fournie)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getItemDate = (item: any, grouped: boolean): Date | null => {
    try {
      if (!item.Date) return null;
      if (grouped) {
        const monthStr = item.Date.toLowerCase();
        const month = MONTH_MAP[monthStr];
        if (month !== undefined) return new Date(item.Année || new Date().getFullYear(), month, 1);
        return null;
      }
      const parsed = parseISO(item.Date);
      return isValid(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  };

  const currentData = useMemo(() => {
    if (!data) return [];
    const baseData = isGrouped 
      ? (isPercentage ? data.group.byPourc : data.group.byKwh)
      : (isPercentage ? data.unGroup.byPourc : data.unGroup.byKwh);

    if (!dateRange?.from) return baseData;

    const from = startOfDay(dateRange.from);
    const to = dateRange.to ? startOfDay(dateRange.to) : from;

    return baseData.filter(item => {
      const itemDate = getItemDate(item, isGrouped);
      if (!itemDate) return false;
      const targetDate = startOfDay(itemDate);
      if (isGrouped) {
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const nextMonthStart = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
        return (monthStart <= to && nextMonthStart > from);
      }
      return targetDate >= from && targetDate <= to;
    });
  }, [data, isGrouped, isPercentage, dateRange]);

  const totals = useMemo(() => {
    return currentData.reduce((acc, curr) => ({
      prod: acc.prod + (curr.Production_Total || 0),
      achat: acc.achat + (curr.Achat || 0),
      conso: acc.conso + (curr.Consommation || 0),
      auto: acc.auto + (curr.Autoconsommation || 0),
      vente: acc.vente + (curr.Vente || 0),
      se: acc.se + (curr.Production_SolarEdge || 0),
      aps: acc.aps + (curr.Production_Ecu || 0),
    }), { prod: 0, achat: 0, conso: 0, auto: 0, vente: 0, se: 0, aps: 0 });
  }, [currentData]);

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

  const handlePageChange = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const handlePageSizeChange = (val: string) => {
    setPageSize(parseInt(val));
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setDateRange(undefined);
    setCurrentPage(1);
  };

  const dataColClass = "w-[110px] min-w-[110px] text-center px-2";

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="flex flex-col space-y-4 pb-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              Historique journalier
            </h3>
            <div className="flex items-center gap-2 ml-4">
              <Rows className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-8 w-28 text-[10px] font-bold">
                  <SelectValue placeholder="5 lignes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 lignes</SelectItem>
                  <SelectItem value="10">10 lignes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
            <Button variant={isGrouped ? "secondary" : "ghost"} size="sm" onClick={() => { setIsGrouped(!isGrouped); setCurrentPage(1); }} className="h-8 gap-2 text-[10px] font-black uppercase">
              {isGrouped ? <Layers className="w-3.5 h-3.5" /> : <ListChecks className="w-3.5 h-3.5" />}
              {isGrouped ? "Regroupé" : "Détaillé"}
            </Button>
            <div className="w-px h-4 bg-border my-auto" />
            <Button variant={isPercentage ? "secondary" : "ghost"} size="sm" onClick={() => { setIsPercentage(!isPercentage); setCurrentPage(1); }} className="h-8 gap-2 text-[10px] font-black uppercase">
              {isPercentage ? <Percent className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              {isPercentage ? "%" : "kWh"}
            </Button>
          </div>
        </div>
        
        {/* Sélecteur de date personnalisé */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-secondary/10 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Période d'analyse :</span>
          </div>
          
          <div className="relative" ref={calendarRef}>
            <input
              type="text"
              readOnly
              onClick={() => setOpen(!open)}
              value={
                dateRange?.from 
                  ? (dateRange.to 
                    ? `${format(dateRange.from, "dd LLL y", { locale: frDateFns })} - ${format(dateRange.to, "dd LLL y", { locale: frDateFns })}`
                    : format(dateRange.from, "dd LLL y", { locale: frDateFns }))
                  : ""
              }
              placeholder="Choisir une période"
              className="w-[280px] bg-background border border-primary/20 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />

            {open && (
              <div className="absolute z-50 mt-2 bg-white dark:bg-card border rounded-xl shadow-2xl p-2 left-0 top-full">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    // On ne ferme pas automatiquement en mode range pour laisser choisir la fin
                  }}
                  locale={fr}
                  weekStartsOn={1}
                  // Anatomie v9 avec styles personnalisés
                  classNames={{
                    today: `text-blue-600 font-bold underline`,
                    selected: `text-white`,
                    range_start: `bg-blue-900 text-white rounded-l-md !opacity-100`,
                    range_end: `bg-blue-900 text-white rounded-r-md !opacity-100`,
                    range_middle: `bg-blue-400 text-white !rounded-none !opacity-100`,
                    day: `h-9 w-9 text-center text-sm p-0 relative focus-within:z-20 font-medium hover:bg-accent rounded-md transition-colors`,
                    month_caption: `flex justify-center pt-1 relative items-center h-9 mb-4 text-sm font-bold uppercase tracking-widest`,
                    weekday: `text-muted-foreground w-9 font-black text-[10px] text-center uppercase`,
                  }}
                />
              </div>
            )}
          </div>

          {dateRange && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters} 
              className="h-8 gap-2 text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
            >
              <FilterX className="w-3 h-3" />
              Effacer le filtre
            </Button>
          )}
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
                <TableHead className={dataColClass}>SolarEdge</TableHead>
                <TableHead className={dataColClass}>APsystems</TableHead>
                <TableHead className={dataColClass}>Total Prod.</TableHead>
                <TableHead className={dataColClass}>Achat</TableHead>
                <TableHead className={dataColClass}>Consommation</TableHead>
                <TableHead className={dataColClass}>Auto Conso.</TableHead>
                <TableHead className={dataColClass}>Vente</TableHead>
                <TableHead className={dataColClass}>Borne</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                <TableRow key={idx} className="border-border/50">
                  <TableCell className="text-[10px] font-bold">{row.Année}</TableCell>
                  <TableCell className="text-[10px] font-bold whitespace-nowrap">{isGrouped ? row.Date : format(parseISO(row.Date), "dd/MM/yyyy")}</TableCell>
                  {!isGrouped && <TableCell className="text-[10px] font-bold">{row.Couleur || "n/c"}</TableCell>}
                  <TableCell className="text-[10px] font-bold text-center">{row.SunHours}h</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Production_SolarEdge)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Production_Ecu)}</TableCell>
                  <TableCell className={dataColClass}>
                    <div className="flex flex-col items-center">
                      <span className={cn("text-[10px] font-black", row.Production_Total >= (row.Prevision || 0) ? "text-emerald-500" : "text-rose-500")}>{renderValue(row.Production_Total)}</span>
                      {row.Prevision !== undefined && !isPercentage && (
                        <span className="text-[8px] text-muted-foreground font-bold italic">Est: {row.Prevision.toFixed(2)} kWh</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Achat)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Consommation)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Autoconsommation)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Vente)}</TableCell>
                  <TableCell className={dataColClass}>{renderValue(row.Borne)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-muted-foreground italic font-medium">
                    Aucune donnée pour cette période.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-primary/5 hover:bg-primary/5 border-t-2 border-primary/20">
                {/* colSpan corrigé : 3 si groupé, 4 si détaillé */}
                <TableCell colSpan={isGrouped ? 3 : 4} className="text-[10px] font-black uppercase text-primary tracking-widest py-4">Total période</TableCell>
                <TableCell /> {/* Pour la colonne Heure Soleil si groupé ? Non, alignons sur les colonnes de chiffres */}
                <TableCell className={dataColClass}><span className="text-[10px] font-black text-primary">{renderValue(totals.se)}</span></TableCell>
                <TableCell className={dataColClass}><span className="text-[10px] font-black text-primary">{renderValue(totals.aps)}</span></TableCell>
                <TableCell className={dataColClass}><span className="text-[10px] font-black text-primary">{renderValue(totals.prod)}</span></TableCell>
                <TableCell className={dataColClass}><span className="text-[10px] font-black text-primary">{renderValue(totals.achat)}</span></TableCell>
                <TableCell className={dataColClass}><span className="text-[10px] font-black text-primary">{renderValue(totals.conso)}</span></TableCell>
                <TableCell className={dataColClass}><span className="text-[10px] font-black text-primary">{renderValue(totals.auto)}</span></TableCell>
                <TableCell className={dataColClass}><span className="text-[10px] font-black text-primary">{renderValue(totals.vente)}</span></TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t border-border/50 py-4">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Page {currentPage} sur {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
