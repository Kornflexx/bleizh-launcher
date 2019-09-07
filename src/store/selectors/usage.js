import { getWeekIndex, getRecommandations, createTimeUsage } from '../../services/recommandation'

const selectDateTracks = (tracks, index, count) => {
  let currentIndex = index
  const selectedTracks = []
  while (currentIndex >= 0 && selectedTracks.length < count) {
    const track = tracks[currentIndex]
    if (track) {
      selectedTracks.push(track)
    }
    currentIndex --
  }
  return selectedTracks
}

const mergeTimeUsage = (t1, t2) => {
  const t = [...t1]
  for (let i = 0; i < t2.length; i++) {
    t[i] += t2[i]
  }
  return t
}

export const selectRecommandations = state => (date = new Date(), length = 5, weekCount = 3) => {
  const { usage: { weekUsages } } = state
  const weekIndex = getWeekIndex(date)

  /*
    weekUsage: {
      1: [ta1, tb1]
      2: [ta2, tb2]
    }
    dateTracks: [[ta1, tb1], [ta2, tb2]]
  */
  const dateTracks = selectDateTracks(weekUsages, weekIndex, weekCount)
  const appWeakTracks = {}
  dateTracks.forEach(weakTracks => {
    weakTracks.forEach(weakAppTrack => {
      if (appWeakTracks[weakAppTrack.packageName]) {
        appWeakTracks[weakAppTrack.packageName] = {
          packageName: weakAppTrack.packageName,
          precision: weakAppTrack.precision,
          timeUsage: mergeTimeUsage(appWeakTracks[weakAppTrack.packageName], weakAppTrack.timeUsage),
          usageCount: 0
        }
      } else {
        appWeakTracks[weakAppTrack.packageName] = { ...weakAppTrack }
      }
    })
  })
  const tracks = []
  for (const key in appWeakTracks) {
    tracks.push(appWeakTracks[key])
  }
  return getRecommandations(date, tracks, length)
}

export const selectRecommandedApplications = state => (date = new Date(), length = 5, weekCount = 3) => {
  const { application: { items } } = state
  const recommandations = selectRecommandations(state)(date, -1, weekCount)
  const recommandedPackageNames = recommandations.map(({ packageName }) => packageName)
  const filteredRecommandedPackageNames = recommandedPackageNames.filter(packageName =>
    items.find(item => item.packageName === packageName)
  )

  return filteredRecommandedPackageNames
    .splice(0, length)
    .map(packageName => items.find(item => item.packageName === packageName))
}
