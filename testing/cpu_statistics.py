import pandas as pd
import matplotlib.pyplot as plt

# Load the data
openwhisk_data = pd.read_csv('resourceUsageData/cpu-openwhisk.csv')
cache_data = pd.read_csv('resourceUsageData/cpu-cache.csv')

# Assuming the CSV has 'timestamp' and 'cpu_usage' columns
openwhisk_data.columns = ['timestamp', 'cpu_usage']  # Adjust the column names if necessary
cache_data.columns = ['timestamp', 'cpu_usage']  # Adjust the column names if necessary

# Convert timestamps to datetime
openwhisk_data['timestamp'] = pd.to_datetime(openwhisk_data['timestamp'], format='%H:%M:%S')
cache_data['timestamp'] = pd.to_datetime(cache_data['timestamp'], format='%H:%M:%S')

# Align the data by trimming irrelevant values at the start and end
start_time = max(openwhisk_data['timestamp'].min(), cache_data['timestamp'].min())
end_time = min(openwhisk_data['timestamp'].max(), cache_data['timestamp'].max())

openwhisk_data = openwhisk_data[(openwhisk_data['timestamp'] >= start_time) & (openwhisk_data['timestamp'] <= end_time)]
cache_data = cache_data[(cache_data['timestamp'] >= start_time) & (cache_data['timestamp'] <= end_time)]

# Plot the data
plt.figure(figsize=(12, 6))
plt.plot(openwhisk_data['timestamp'], openwhisk_data['cpu_usage'], label='OpenWhisk', color='blue')
plt.plot(cache_data['timestamp'], cache_data['cpu_usage'], label='Cache Service', color='orange')
plt.xlabel('Time')
plt.ylabel('CPU Usage')
plt.title('CPU Usage Comparison')
plt.legend()
plt.grid(True)
plt.tight_layout()

# Save the plot
plt.savefig('cpu_usage_comparison.png')
plt.show()

# Calculate and print summary statistics
openwhisk_avg_cpu = openwhisk_data['cpu_usage'].mean()
cache_avg_cpu = cache_data['cpu_usage'].mean()

print(f'Average CPU Usage for OpenWhisk: {openwhisk_avg_cpu}')
print(f'Average CPU Usage for Cache Service: {cache_avg_cpu}')