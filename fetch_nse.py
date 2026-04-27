import sys
import json
from nsepython import nse_quote

def get_price(symbol):
    try:
        data = nse_quote(symbol)
        price = data['priceInfo']['lastPrice']
        change = data['priceInfo']['change']
        changePercent = data['priceInfo']['pChange']
        return {
            "price": float(price),
            "change": float(change),
            "changePercent": float(changePercent),
            "source": "NSEPython"
        }
    except:
        return None

if len(sys.argv) > 1:
    symbols_str = sys.argv[1]
    symbols = [s.strip() for s in symbols_str.split(',') if s.strip()]
    results = {}
    
    for symbol in symbols:
        clean_symbol = symbol.replace('.NS', '').replace('.BO', '')
        
        # Scrip Mapping
        mapping = {
            "TMPV": "TATAMOTORS",
            "TMCV": "TATAMOTORS",
            "GVT&D": "GET&D",
            "TATACAP": "TATAINVEST",
            "ITCHOTELS": "ITC"
        }
        
        lookup = mapping.get(clean_symbol, clean_symbol)
        
        data = get_price(lookup)
        if data:
            results[symbol] = data
            
    print(json.dumps(results))
