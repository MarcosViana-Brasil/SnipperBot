import { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import axios from 'axios'

import './App.css'

function App() {

  const [ticker, setTicker] = useState({})
  const [tradingView, setTradingView] = useState({})
  const [lastBuyT, setLastBuyT] = useState(0)
  const [lastSellT, setLastSellT] = useState(0)


  const [config, setConfig] = useState({
    buy: 0,
    sell: 0,
    side: 'BUY',
    symbol: 'BTCUSDT'
  })

  const [profit, setProfit] = useState({
    value: 0,
    perc: 0,
    lastBuy: 0
  })

  function processData(ticker) {
    const lastPrice = parseFloat(ticker.c)
    if (config.side === 'BUY' && config.buy > 0 && lastPrice <= config.buy) {
      console.log('Comprou...' + lastPrice)
      buyNow()
      config.side = 'SELL'

      setLastBuyT(lastPrice)

      setProfit({
        value: profit.value,
        perc: profit.perc,
        lastBuy: lastPrice
      })
    } else if (config.side === 'SELL' && config.sell > profit.lastBuy && lastPrice >= config.sell) {
      console.log('Vendeu...' + lastPrice)
      sellNow()
      config.side = 'BUY'

      const lastProfit = lastPrice - profit.lastBuy

      setLastSellT(lastPrice)

      setProfit({
        value: profit.value + lastProfit,
        perc: profit.perc + (lastPrice * 100 / profit.lastBuy - 100),
        lastBuy: 0
      })
    }
  }

  function buyNow() {
    axios.post('http://localhost:3001/BUY/' + config.symbol + '/0.01')
      .then(result => console.log(result.data))
      .catch(err => console.error(err))
  }

  function sellNow() {
    axios.post('http://localhost:3001/SELL/' + config.symbol + '/0.01')
      .then(result => console.log(result.data))
      .catch(err => console.error(err))
  }

  const { lastJsonMessage } = useWebSocket('wss://stream.binance.com:9443/stream?streams=' + config.symbol.toLowerCase() + '@ticker', {
    onMessage: () => {
      if (lastJsonMessage && lastJsonMessage.data) {
        if (lastJsonMessage.stream === config.symbol.toLowerCase() + '@ticker') {
          setTicker(lastJsonMessage.data)
          processData(lastJsonMessage.data)
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
        "symbol": "BINANCE:" + config.symbol,
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
  }, [config.symbol])

  function onSymbolChange(event) {
    setConfig(prevState => ({ ...prevState, symbol: event.target.value }))
  }

  function onValueChange(event) {
    // console.log(event.target.value)
    setConfig(prevState => ({ ...prevState, [event.target.id]: parseFloat(event.target.value) }))
  }

  return (
    <div>
      <h1>SniperBot 1.0</h1>
      <div className="tradingview-widget-container">
        <div id="tradingview_318cb"></div>
      </div>
      <div className='dashboard'>

        {/* Snipper */}
        <div>
          <b>Snipe:</b>
          <br />
          Symbol:
          <select id='symbol' defaultValue={config.symbol} onChange={onSymbolChange}>
            <option>BTCUSDT</option>
            <option>ETHUSDT</option>
          </select>
          <br />
          By at: <input type='number' id='buy' defaultValue={config.buy} onChange={onValueChange} />
          <br />
          Sell at: <input type='number' id='sell' defaultValue={config.sell} onChange={onValueChange} />
          <br />
          <div>
            <label> Last Buy:</label> <span className='vlrText'> {lastBuyT.toFixed(4)} </span>
            <br />
            <label> Last Sell:</label> <span className='vlrText'> {lastSellT.toFixed(4)} </span>
          </div>
        </div>

        {/* Profit */}
        <div>
          <b>Profit:</b>
          <br />
          Profit $ : {profit && profit.value.toFixed(4)}
          <br />
          Profit % : {profit && profit.perc.toFixed(2)}
        </div>


        {/* Ticker */}
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
