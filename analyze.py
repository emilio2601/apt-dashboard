import pandas as pd
import os

CSV_FILE = "mta_travel_times.csv"

def analyze_travel_times(csv_file):
    if not os.path.exists(csv_file):
        print("CSV file not found.")
        return
    
    df = pd.read_csv(csv_file)
    
    # Convert travel times to numeric, handling missing values
    df.iloc[:, 1:] = df.iloc[:, 1:].apply(pd.to_numeric, errors='coerce')
    
    # Drop rows with NaN values
    df = df.dropna()
    
    # Count occurrences where one route is faster than the other
    faster_8st_union = (df.iloc[:, 1] < df.iloc[:, 2]).sum()
    faster_14st_7ave = (df.iloc[:, 2] < df.iloc[:, 1]).sum()
    total_entries = len(df)
    
    if total_entries == 0:
        print("No valid travel time data available.")
        return
    
    percent_faster_8st_union = (faster_8st_union / total_entries) * 100
    percent_faster_14st_7ave = (faster_14st_7ave / total_entries) * 100
    
    avg_time_8st_union = df.iloc[:, 1].mean()
    avg_time_14st_7ave = df.iloc[:, 2].mean()
    
    # Calculate timespan covered
    df.iloc[:, 0] = pd.to_datetime(df.iloc[:, 0], errors='coerce')
    df = df.dropna()
    time_span = df.iloc[:, 0].max() - df.iloc[:, 0].min()
    
    print(f"Total number of samples: {total_entries}")
    print(f"Time span covered: {time_span}")
    print(f"Route from 8 St to Union St is faster {percent_faster_8st_union:.2f}% of the time.")
    print(f"Route from 14 St Union Sq to 7 Ave is faster {percent_faster_14st_7ave:.2f}% of the time.")
    print(f"Average time taken for 8 St to Union St: {avg_time_8st_union:.2f} min")
    print(f"Average time taken for 14 St Union Sq to 7 Ave: {avg_time_14st_7ave:.2f} min")

if __name__ == "__main__":
    analyze_travel_times(CSV_FILE)
