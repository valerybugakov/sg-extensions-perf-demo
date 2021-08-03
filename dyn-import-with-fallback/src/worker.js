console.log('worker init')

const extensionIDs = ['1', '2', '3']

importScripts(...extensionIDs.map(id =>`./extensions/${id}.js`))

console.time('dynimp fail')
import('./extensions/1.js').then(() => console.log('imported ext')).catch(() => {
    console.timeEnd('dynimp fail')
    console.log('import() not supported')
})
console.log('after import')
