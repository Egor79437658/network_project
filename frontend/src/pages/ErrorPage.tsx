import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@shadcnComponents/alert"
import { Card } from "@shadcnComponents/card"
import { AlertCircleIcon } from "lucide-react"
import type { FC } from "react"
import { isRouteErrorResponse, useRouteError } from "react-router-dom"

export const ErrorPage: FC = () => {
  const error = useRouteError()

  let errorMessage: string | undefined
  let errorStatus: number | undefined
  let errorStatusText: string | undefined

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status
    errorStatusText = error.statusText
    errorMessage = String(error.data?.message || error.data)
  } else if (error instanceof Error) {
    errorMessage = error.message
    console.error("Uncaught error:", error)
  } else {
    errorMessage = String(error)
  }

  return (
    <Card className="flex h-screen w-screen items-center justify-center">
      <Alert variant="destructive" className={cn("h-1/3 w-1/3", "font-bold")}>
        <AlertCircleIcon className="mr-1 size-5" />
        <AlertTitle className="text-xl">500</AlertTitle>
        <AlertDescription className="text-xl">
          <p>Это страница ошибки</p>
          <p>Если вы это видите, значит что-то очень сильно сломалось!</p>
          {errorStatus && (
            <p>
              {errorStatus} {errorStatusText}
            </p>
          )}
          {errorMessage && <p>{errorMessage}</p>}
        </AlertDescription>
      </Alert>
    </Card>
  )
}
