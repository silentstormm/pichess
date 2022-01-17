;(() => {
  document.getElementById('help-toggle').addEventListener('click', () => {
    let help = document.getElementById('help')
    if (help.style.display === 'block') help.style.display = 'none'
    else help.style.display = 'block'
  })
})()
