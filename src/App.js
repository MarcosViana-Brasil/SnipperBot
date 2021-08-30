import { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import './App.css'

function App() {

  const [ticker, setTicker] = useState({})
  const [tradingView, setTradingView] = useState({})

  const { lastJsonMessage } = useWebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@ticker', {
    onMessage: () => {
      if (lastJsonMessage && lastJsonMessage.data) {
        if (lastJsonMessage.stream === 'btcusdt@ticker') {
          setTicker(lastJsonMessage.data)
        }
      }
    },
    onError: (event) => {

    }
  })

  useEffect(() => {
    const tv = new window.TradingView.widget(
      {
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "details": true,
        "container_id": "tradingview_318cb"
      }
    )
    setTradingView(tv)
  }, [])

  return (
    <div>
      <h1>SnipperBot 1.0</h1>
      <div class="tradingview-widget-container">
        <div id="tradingview_318cb"></div>
      </div>
      <div>
        <div>
          <b>Ticker 24h:</b><br />
          Open: {ticker && ticker.o} <br />
          High: {ticker && ticker.h} <br />
          Low:  {ticker && ticker.l} <br />
          Last: {ticker && ticker.c} <br />
          Change %: {ticker && ticker.P}
        </div>
      </div>
    </div>
  )
}

export default App
