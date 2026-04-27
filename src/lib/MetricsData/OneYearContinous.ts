import type { dataType } from "./OneDayContinous"

const oneYearContinous = (data: dataType) => {
  const safeData = data || []
  const result: dataType = []

  const sortedInput = [...safeData]
    .map((item) => ({
      ...item,
      timeValue: new Date(item.timestamp).getTime(),
      isOriginal: true
    }))
    .sort((a, b) => a.timeValue - b.timeValue)

  const now = new Date()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth()

  const startOfWindow = new Date(Date.UTC(currentYear, currentMonth - 11, 1, 0, 0, 0))

  for (let i = 0; i < 12; i++) {
    const tickDate = new Date(startOfWindow)
    tickDate.setUTCMonth(startOfWindow.getUTCMonth() + i)
    tickDate.setUTCHours(0, 0, 0, 0)

    const tickTimeValue = tickDate.getTime()
    let lastKnownValue = 0
    let isMatch = false

    const validPastPoints = sortedInput.filter(d => d.timeValue <= tickTimeValue)

    if (validPastPoints.length > 0) {
      const lastPoint = validPastPoints[validPastPoints.length - 1]
      lastKnownValue = lastPoint.value

      if (lastPoint.timeValue === tickTimeValue) {
        isMatch = true
      }
    }

    result.push({
      timestamp: tickDate.toISOString(),
      value: lastKnownValue,
      isOriginal: isMatch 
    })
  }

  return result
}

export default oneYearContinous