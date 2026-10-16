import { handleProgressEvents } from "./generalProgressHandler";


export const handleSimulationProgress = () => {
    handleProgressEvents("simulation", "Прогресс", "Симуляция завершена", "При моделировании произошла ошибка!", "bottom-right")
}

export const handleErrorGenerationProgress = () => {
    handleProgressEvents("error-generation", "Генерация ошибок", "Ошибки сгенерированны!", "При генерации ошибок произошла ошибка!", "bottom-center")
}
export const handleDataGenerationProgress = () => {
    handleProgressEvents("data-generation", "Генерация данных", "Данные сгенерированны!", "При генерации данныъ произошла ошибка!", "bottom-left")
}
export const handleCoderProgress = () => {
    handleProgressEvents("coder", "Кодирование сообщений", "Кодирование завершено!", "При кодировании сообщений произошла ошибка!", "bottom-center")
}
export const handleDecderProgress = () => {
    handleProgressEvents("decoder", "Декодирование сообщений", "Декодирование завершено!", "При декодировании сообщений произошла ошибка!", "bottom-left")
}