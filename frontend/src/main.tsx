import { TrafficApp } from './app/TrafficApp'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Application root element was not found')

new TrafficApp().bootstrap(root)
