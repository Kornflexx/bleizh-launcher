import dayjs from 'dayjs'

const DEFAULT_PRECISION = 1 / 4


const getFloatingIndex = (date, precision) => {
  return date.getHours() * (1 / precision) + (date.getMinutes() / (60 * precision))
}

const getUsageCoeff = (indexDelta, length) => {
  const normalizedDelta = indexDelta / (length / 2)
  return (1 / (1 + 30 * Math.pow(normalizedDelta, 2)) - normalizedDelta * (1 / 31))
}

const getIndexDelta = (index, floatingIndex, length) => {
  const rawDelta = Math.abs(index - floatingIndex)
  return rawDelta > length / 2 ? Math.abs(rawDelta - length) : rawDelta
}

const getTargetValue = (track, floatingIndex) => {
  const { length } = track.timeUsage
  return track.timeUsage.reduce((acc, value, index) => {
    const indexDelta = getIndexDelta(index, floatingIndex, length)
    const coeff = getUsageCoeff(indexDelta, length)
    return acc + coeff * value
  }, 0)
}

export const createTimeUsage = (precision = DEFAULT_PRECISION) => {
  return Array.from(Array(24 * (1 / precision))).map(() => 0)
}

export const addUsage = (track, date = new Date()) => {
  const { timeUsage, precision, usageCount } = track
  const nextTimeUsage = [...timeUsage]
  const floatingIndex = getFloatingIndex(date, precision)
  const index1 = Math.floor(floatingIndex)
  const index2 = Math.ceil(floatingIndex)
  const sameIndex = index1 === index2
  if (sameIndex) {
    nextTimeUsage[floatingIndex] += 1
  } else {
    const value1 = index2 - floatingIndex
    const value2 = floatingIndex - index1
    nextTimeUsage[index1] = nextTimeUsage[index1] + value1
    nextTimeUsage[index2] = nextTimeUsage[index2] + value2
  }

  return {
    ...track,
    timeUsage: nextTimeUsage,
    usageCount: usageCount + 1
  }
}

export const getRecommandations = (targetDate, tracks, length) => {
  if (tracks.length === 0) return [];

  const targetValues = tracks.map(track => {
    const floatingIndex = getFloatingIndex(targetDate, track.precision)
    return {
      packageName: track.packageName,
      value: getTargetValue(track, floatingIndex, 12)
    }
  })
  const sortedTargetValues = targetValues.sort((a, b) => b.value - a.value)
  const maxTargetValue = sortedTargetValues[0].value

  const sortedUsageTracks = tracks.sort((a, b) => b.usageCount - a.usageCount)
  const maxUsageCount = sortedUsageTracks[0].usageCount

  const normalizedTargetValues = targetValues.map(item => ({
    ...item,
    value: item.value / maxTargetValue
  }))
  const normalizedUsageValues = tracks.map(track => ({
    packageName: track.packageName,
    value: track.usageCount / maxUsageCount
  }))

  const results = normalizedTargetValues
    .map(item => {
      const usage = normalizedUsageValues.find(({ packageName }) => packageName === item.packageName)
      return {
        packageName: item.packageName,
        value: (usage.value || 0) + 4 * item.value
      }
    })
    .sort((a, b) => b.value - a.value)

  if (length === -1) return results
  return results
    .slice(0, Math.min(tracks.length, length))
}

export const createTrack = (packageName, precision = DEFAULT_PRECISION) => ({
  packageName,
  precision: precision,
  timeUsage: createTimeUsage(precision),
  usageCount: 0
})

export const getWeekIndex = rawDate => {
  const jesusDate = dayjs(`2000-01-01`)
  const date = dayjs(rawDate)
  return date.diff(jesusDate, 'weeks')
}
/*
const appTracks = []
appTracks[0] = createTrack('clash')
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T09:00:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T09:00:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T09:00:00Z'))

appTracks[0] = addUsage(appTracks[0], new Date('2000-01-02T10:14:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-02T10:14:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-02T10:14:00Z'))

appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T12:00:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T12:00:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T12:00:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T12:00:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T12:00:00Z'))
appTracks[0] = addUsage(appTracks[0], new Date('2000-01-01T12:00:00Z'))


appTracks[1] = createTrack('maps')
appTracks[1] = addUsage(appTracks[1], new Date('2000-01-01T09:00:00Z'))


appTracks[2] = createTrack('clover')
appTracks[2] = addUsage(appTracks[2], new Date('2000-01-01T09:00:00Z'))
appTracks[2] = addUsage(appTracks[2], new Date('2000-01-02T09:10:00Z'))react-nat
appTracks[2] = addUsage(appTracks[2], new Date('2000-01-02T09:12:21Z'))


appTracks[3] = createTrack('chrome')
appTracks[3] = addUsage(appTracks[3], new Date('2000-01-02T20:10:00Z'))
appTracks[3] = addUsage(appTracks[3], new Date('2000-01-02T19:12:21Z'))

appTracks.forEach(appTrack => {
  console.log(appTrack.packageName, appTrack.timeUsage, appTrack.timeUsage.reduce((acc, v) => acc + v, 0))
})
console.log(
  '2000-01-01T09:07:00Z',
  getRecommandations(new Date('2000-01-01T09:00:00Z'), appTracks, 4),
  getRecommandations(new Date('2000-01-01T18:00:00Z'), appTracks, 4)
)
console.log('la', getUsageCoeff(13, 12))

*/








