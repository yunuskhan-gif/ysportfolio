

export type dataType = {
  timestamp: string
  value: number
  isOriginal?: boolean 
}[]

const OneDayContinous = (data: dataType) => {
  const safeData = data || []

  const sortedData = safeData.map((item) => ({
    timestamp: item.timestamp,
    value: item.value,
    dateObj: new Date(item.timestamp),
    isOriginal: true, 
  })).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  if (sortedData.length === 0) return []

  const baseDate = sortedData[0].dateObj
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const day = baseDate.getDate()

  const checkpoints = [
    { h: 9, m: 15 },
    { h: 11, m: 15 },
    { h: 13, m: 15 },
    { h: 15, m: 30 },
  ]

  const mergedList = [...sortedData]

  checkpoints.forEach(({ h, m }) => {
    // Create checkpoint in local time, FormatTime will handle the Asia/Kolkata shift if needed
    const localPoint = new Date(year, month, day, h, m)
    
    const exists = sortedData.some(
      (d) => d.dateObj.getHours() === h && d.dateObj.getMinutes() === m
    )

    if (!exists) {
      mergedList.push({
        timestamp: localPoint.toISOString(),
        value: 0,
        dateObj: localPoint,
        isOriginal: false, 
      })
    }
  })

  mergedList.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

  let lastKnownValue = 0

  return mergedList.map((item) => {
    if (item.isOriginal) {
      lastKnownValue = item.value
    }

    return {
      timestamp: item.timestamp,
      value: item.isOriginal ? item.value : lastKnownValue, 
      isOriginal: item.isOriginal
    }
  })
}

export default OneDayContinous