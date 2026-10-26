import { FC, useEffect, useRef, useState } from "react";
import { useTable } from "@tanstack/react-table";
import { features } from "./features";
import { columns, SimulationResultExtended } from "./columns";
import { useAsyncList } from "@react-stately/data";
import { NetworkLineMode, DatabaseService } from "@bindings/backend/services";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shadcnComponents/table";
import { cn, transformPolynomial } from "@/lib/utils";
import { PolynomialModeEnum } from "@/stores/coderStore";
import { Events, WML } from "@wailsio/runtime";
import { DbFileTooltip } from "./DbFileTooltip";

const PAGE_SIZE = 10;
const NETWORK_COL_SPAN = 4;
const TOTAL_COLUMNS = 13;

export const ResultsTable: FC = () => {
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const list = useAsyncList<SimulationResultExtended>({
    async load({ cursor }) {
      const offset = cursor ? Number(cursor) : 0;
      const res = await DatabaseService.GetSimulationResults({
        offset,
        limit: PAGE_SIZE,
      });
      if (res === null) throw new Error("Ошибка при загрузке данных");

      if (res.length < PAGE_SIZE) setAllDataLoaded(true);

      const items = res.map(el => {

        const polynomialDegree = el.dataLength-el.messageLength
        const polynomial = 2**polynomialDegree + el.polynomial
        return {...el, acceptedPackets: el.totalTransmited - el.detectedErrors - el.undetectedErrors, polynomial: polynomial }

      })

      return {
        items: items,
        cursor: String(offset + PAGE_SIZE),
      };
    },
  });

  const table = useTable({
    features,
    data: list.items,
    columns,
  });

  const loadMoreRef = useRef(list.loadMore);
  loadMoreRef.current = list.loadMore;

  useEffect(() => {
    if (!sentinel || allDataLoaded) return;
    if (list.loadingState !== "idle") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, allDataLoaded, list.loadingState]);

  useEffect(() => {
    const off = Events.On("simulation:finished", () => {
      setAllDataLoaded(false);
      list.reload();
    });
    WML.Reload();
    return () => {
      off();
    };
  }, []);

  const isEmpty = list.items.length === 0;
  const isInitialLoading = list.loadingState === "loading" && isEmpty;
  const isLoadingMore = list.loadingState === "loadingMore";

  return (
    <div className="h-full w-full overflow-auto p-4 [&>div]:overflow-visible">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold mb-4">Результаты симуляций</h2>
        <DbFileTooltip />
      </div>

      <Table>
        <TableHeader className="sticky -top-4 z-10 bg-background shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={
                    header.column.id === "networkParams" ? NETWORK_COL_SPAN : 1
                  }
                  className={cn(
                    "font-semibold text-base",
                    header.column.id === "networkParams" && "text-center",
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {list.error ? (
            <TableRow>
              <TableCell
                colSpan={TOTAL_COLUMNS}
                className="h-24 text-destructive"
              >
                <div className="mx-auto text-center">
                  Ошибка при загрузке данных
                </div>
                <div className="mx-auto text-center">{list.error.message}</div>
              </TableCell>
            </TableRow>
          ) : isInitialLoading ? (
            <TableRow>
              <TableCell
                colSpan={TOTAL_COLUMNS}
                className="h-24 text-center shimmer"
              />
            </TableRow>
          ) : isEmpty ? (
            <TableRow>
              <TableCell colSpan={TOTAL_COLUMNS} className="h-24 text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="text-base">
                {row.getAllCells().flatMap((cell) => {
                  if (cell.column.id === "networkParams") {
                    const params = cell.row.original.networkParams;

                    if (params.mode === NetworkLineMode.Independed) {
                      return [
                        <TableCell
                          key={cell.id}
                          colSpan={NETWORK_COL_SPAN}
                          className="text-center"
                        >
                          <div className="grid grid-rows-2">
                            <span className="text-xs text-muted-foreground">
                              незвисимая вероятность
                            </span>
                            {params.independedPropability}
                          </div>
                        </TableCell>,
                      ];
                    }

                    return [
                      <TableCell key={`${cell.id}-good`}>
                        <div className="grid grid-rows-2">
                          <span className="text-xs text-muted-foreground">
                            В хорошем состоянии
                          </span>
                          <span>{params.propabilityInGoodCondition}</span>
                        </div>
                      </TableCell>,
                      <TableCell key={`${cell.id}-bad`}>
                        <div className="grid grid-rows-2">
                          <span className="text-xs text-muted-foreground">
                            В плохом состоянии
                          </span>
                          <span>{params.propabilityInBadCondition}</span>
                        </div>
                      </TableCell>,

                      <TableCell key={`${cell.id}-toBad`}>
                        <div className="grid grid-rows-2">
                          <span className="text-xs text-muted-foreground">
                            Переход в плохое
                          </span>
                          <span>{params.propabilityToGoBad}</span>
                        </div>
                      </TableCell>,
                      <TableCell key={`${cell.id}-toGood`}>
                        <div className="grid grid-rows-2">
                          <span className="text-xs text-muted-foreground">
                            Переход в хорошее
                          </span>
                          <span>{params.propabilityToGoGood}</span>
                        </div>
                      </TableCell>,
                    ];
                  }

                  if (cell.column.id === "networkParams_mode") {
                    return [
                      <TableCell key={cell.id}>
                        {cell.row.original.networkParams.mode ===
                        NetworkLineMode.Independed
                          ? "Независимые"
                          : "Модель Гильберта"}
                      </TableCell>,
                    ];
                  }
                  if (cell.column.id === "polynomial") {
                    const polynomialBinary =
                      cell.row.original.polynomial.toString(2);
                    const polynomialArray = transformPolynomial(
                      PolynomialModeEnum.array,
                      polynomialBinary,
                    );
                    return [
                      <TableCell key={cell.id}>
                        <div className="grid grid-rows-2 gap-2">
                          <span>{polynomialBinary}</span>
                          <span>{polynomialArray}</span>
                        </div>
                      </TableCell>,
                    ];
                  }

                  return [
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>,
                  ];
                })}
              </TableRow>
            ))
          )}

          {!allDataLoaded && !isEmpty && !list.error && (
            <TableRow>
              <TableCell colSpan={TOTAL_COLUMNS} className="h-16 text-center">
                <div ref={setSentinel} className="h-4 w-full" />
                {isLoadingMore && <span className="shimmer">Загрузка…</span>}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
