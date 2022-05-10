const gameIds = [
  '730', // CS:GO
]

const getGameData = (id) => {
  return new Promise((resolve) => {
    const url = `https://steamcharts.com/app/${id}/chart-data.json`
    const headers ={
      'Access-Control-Allow-Origin': '*'
    }
    const opts = {
        method: 'GET',
        mode: 'cors',
        headers: headers
      }
    fetch(url, opts)
      .then((res) => {
        console.log('res', res);
        res.json().then((data) => {
          resolve({
            data,
            id
          })
        })
      })
  })
}

const getDayTimes = (time) => {
  const datetime = new Date(time)
  const year = datetime.getFullYear()
  const mth = datetime.getMonth()
  const day = datetime.getDate()
  const startOfDay = new Date(year, mth, day).getTime()
  const endOfDay = new Date(year, mth, day, 23, 59, 59, 99).getTime()
  
  return {
    day: `${year}/${mth}/${day}`,
    startOfDay,
    endOfDay
  }
}

const processData = (set) => {
  let lastIdx = set.data.length - 1
  let chartData = []
  let point = {}
  let valTime
  let valCnt
  let daytime

  const createPoint = (time, cnt) => {
    daytime = getDayTimes(time)

    return {
      day: daytime.day,
      start: daytime.startOfDay,
      end: daytime.endOfDay,
      high: cnt,
      low: cnt
    }
  }

  set.data.map((val, idx) => {
    valTime = val[0]
    valCnt = val[1]
    
    if (idx === 0) {
      point = createPoint(valTime, valCnt)
    } else {
      if (valTime >= point.start && valTime <= point.end) {  
        if (point.high < valCnt) {
          point.high = valCnt
        } else if (point.low > valCnt) {
          point.low = valCnt
        }
      } else {
        chartData.push(Object.assign({}, point))
        point = createPoint(valTime, valCnt)
      }

      if (lastIdx === idx) {
        chartData.push(Object.assign({}, point))
      }
    }
  })

  console.log(`Game: ${set.id}:`, chartData)
}

const init = () => {
  let datasets = []

  gameIds.forEach((id) => {
    datasets.push(getGameData(id))
  })

  Promise.allSettled(datasets)
    .then((results) => {
      results.forEach((res) => {
        processData(res.value)
      })
    })
}

window.addEventListener('DOMContentLoaded', init);
