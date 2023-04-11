export default function postAge(postTime) { // Should be neater...
  const dateNow = Date.now()
  
  // convert from ms to min
  let diff = Math.floor((dateNow - postTime) / 60000)
  if (diff < 1) return `Just now`
  
  const mins = diff % 60
  diff = (diff - mins) / 60
  const hours = diff % 24
  diff = (diff - hours) / 24
  const days = diff % 31
  diff = (diff - days) / 31
  const months = diff % 12
  diff = (diff - months) /12
  const years = diff

  if      (years  > 0) return (years  + 'y' + `${ months > 0 ? ' ' + months  + 'm' : '' } ago`)
  else if (months > 0) return (months + 'm' + `${ days   > 0 ? ' ' + days    + 'd' : '' } ago`)
  else if (days   > 0) return (days   + 'd' + `${ hours  > 0 ? ' ' + hours   + 'h' : '' } ago`)
  else if (hours  > 0) return (hours  + 'h' + `${ mins   > 0 ? ' ' + mins    + 'm' : '' } ago`)
  else if (mins   > 0) return (mins   +                                              'min ago')
}
