import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

function App() {
  const [stocks, setStocks] = useState([])
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    const socket = io('http://localhost:3001')

    socket.on('connect', () => {
      setConnected(true)
      console.log('Connected to server')
    })

    socket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })

    socket.on('stock-update', (updatedStocks) => {
      setStocks(prevStocks => {
        // We could track previous prices here to trigger animations
        return updatedStocks
      })
      setLastUpdate(new Date().toLocaleTimeString())
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            MarketPulse TRADING
          </h1>
          <p className="text-slate-400 font-medium">Real-time WebSocket Stock Feed</p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
            <span className="text-sm font-bold uppercase tracking-wider">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
          {lastUpdate && (
            <div className="text-xs text-slate-500 font-mono border-l border-slate-700 pl-4">
              Last Sync: {lastUpdate}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all duration-300 p-6 rounded-2xl shadow-xl hover:shadow-cyan-900/10 group overflow-hidden relative"
            >
              {/* Background Glow */}
              <div className={`absolute -right-10 -top-10 w-24 h-24 blur-3xl opacity-20 transition-all duration-1000 ${stock.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold font-mono tracking-tighter text-white">{stock.symbol}</h2>
                  <p className="text-xs text-slate-400 font-medium truncate w-32">{stock.name}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {stock.change >= 0 ? '↑ Bull' : '↓ Bear'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-black text-white tracking-tight flex items-baseline">
                  <span className="text-xl mr-1 font-medium text-slate-500">$</span>
                  {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center text-sm font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
                  <span className="mx-2 opacity-30">|</span>
                  <span>{stock.change >= 0 ? '+' : ''}{stock.percentage.toFixed(2)}%</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-widest">
                <span>NASDAQ</span>
                <button className="text-cyan-400 font-black hover:text-cyan-300 transition-colors uppercase">Trade →</button>
              </div>
            </div>
          ))}
        </div>

        {stocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="font-medium animate-pulse">Establishing secure connection to trade desk...</p>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto mt-20 text-center text-slate-600 text-[10px] font-black tracking-widest uppercase pb-10">
        &copy; 2026 Real-time Communications Webinar
      </footer>
    </div>
  )
}

export default App
