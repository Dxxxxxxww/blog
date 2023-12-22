const str = '123>'

const escapeRE = /["'&<>]/
function escapeHtml(string) {
  const str = '' + string
  const match = escapeRE.exec(str)
  if (!match) return

  let html = ''
  let escaped
  let index
  let lastIndex = 0
  for (let index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escaped = '&quot;'
        break
      case 38: // &
        escaped = '&amp;'
        break
      case 39: // '
        escaped = '&#39;'
        break
      case 60: // <
        escaped = '&lt;'
        break
      case 62: // >
        escaped = '&gt;'
        break
      default:
        continue
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index)
    }

    lastIndex = index + 1
    html += escaped

  }
  return lastIndex !== index ? html + str.substring(lastIndex, index) : html
}

console.log(escapeHtml(str))