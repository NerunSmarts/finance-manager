from twelvedata import TDClient
import csv

# Initialize client
td = TDClient(apikey="a17e94cd212b48f5a888d6ced4b63844")

# List of symbols to fetch 
# (this will pull all symbols of holdings from the database once the database is implemented)
symbols = ["AAPL", "GOOGL", "MSFT"]

# Fetch the latest prices using the quote endpoint
quotes = td.quote(symbol=",".join(symbols)).as_json()

# For now, this script will write the latest prices to a CSV file. 
# Once the database is implemented, this script will write the latest prices to the database.

# Open a file in write mode

with open('latest_prices.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    
    # Write the header
    writer.writerow(["Symbol", "Latest Price"])
    
    # Extract and write the latest prices
    for symbol in symbols:
        try:
            latest_price = quotes[symbol]['close']
            writer.writerow([symbol, latest_price])
        except KeyError:
            print(f"Error: Could not find the latest price for {symbol}")
print ("Python script ran!")