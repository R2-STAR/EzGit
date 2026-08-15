import fs from 'node:fs'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const css = fs.readFileSync('src/index.css', 'utf8')

postcss([tailwindcss('./tailwind.config.js'), autoprefixer])
  .process(css, { from: 'src/index.css' })
  .then(result => {
    const hasInk950 = result.css.includes('--tw-bg-opacity')
    const hit = result.css.match(/background-color:\s*[^;]+/)
    console.log('CSS compiled OK,', result.css.length, 'chars')
    console.log('body background rule:', result.css.split('\n').find(l => l.includes('background-color')))
  })
  .catch(err => {
    console.error('COMPILE ERROR:', err.message)
    process.exit(1)
  })
