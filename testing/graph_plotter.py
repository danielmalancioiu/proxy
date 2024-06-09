# import pandas as pd
# import matplotlib.pyplot as plt
# import matplotlib.dates as mdates
# from datetime import datetime

# # Load and prepare the data
# def load_data():
#     # Assuming 'testResults.json' is in the same directory as this script
#     df = pd.read_json('responseTimeData/testResults-10.json')
    
#     # Convert data into separate DataFrames for OpenWhisk and Cache Service
#     df_openwhisk = pd.DataFrame(df['openwhisk'].tolist())
#     df_cache = pd.DataFrame(df['cacheService'].tolist())

#     # Convert the 'now' string to datetime objects
#     df_openwhisk['now'] = pd.to_datetime(df_openwhisk['now'])
#     df_cache['now'] = pd.to_datetime(df_cache['now'])

#     return df_openwhisk, df_cache

# # Plot the data
# def plot_data(df_openwhisk, df_cache):
#     fig, ax = plt.subplots(figsize=(10, 6))

#     # Plot OpenWhisk response times
#     ow_plot, = ax.plot(df_openwhisk['now'], df_openwhisk['timeTaken'], label='OpenWhisk', marker='o', color='blue')

#     # Highlight cold starts
#     for i, row in df_openwhisk.iterrows():
#         if row['isColdStart']:
#             ax.plot(row['now'], row['timeTaken'], label='Cold Start', marker='o', color='red')
    
#     # Plot Cache Service response times
#     cs_plot, = ax.plot(df_cache['now'], df_cache['timeTaken'], label='Cache Service', marker='o', color='green')
    
#     # Formatting the plot
#     ax.set_title('Response Times Comparison Over Time')
#     ax.set_xlabel('Time')
#     ax.set_ylabel('Response Time (ms)')
#     ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M:%S'))
#     plt.xticks(rotation=45)
#     plt.legend(handles=[ow_plot, cs_plot], loc='upper right')
#     plt.grid(True)

#     # Save and show the plot
#     plt.tight_layout()
#     plt.savefig('response_times_simple-final.png')
#     plt.show()

# def main():
#     df_openwhisk, df_cache = load_data()
#     plot_data(df_openwhisk, df_cache)

# if __name__ == '__main__':
#     main()


# # ,
# #   "statistics": {
# #     "openWhiskStats": {
# #       "median": 118,
# #       "percentile90": 151,
# #       "percentile95": 151,
# #       "percentile99": 151
# #     },
# #     "cacheServiceStats": {
# #       "median": 13,
# #       "percentile90": 140,
# #       "percentile95": 140,
# #       "percentile99": 140
# #     }
# #   }

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import numpy as np

# Load and prepare the data
def load_data():
    # Assuming 'testResults-postsFunction-simple.json' is in the same directory as this script
    df = pd.read_json('responseTimes-complex.json')
    
    # Convert data into separate DataFrames for OpenWhisk and Cache Service
    df_openwhisk = pd.DataFrame(df['openwhisk'].tolist())
    df_cache = pd.DataFrame(df['cacheService'].tolist())

    # Generate elapsed time in seconds, increasing by 15 seconds each iteration
    df_openwhisk['elapsed_time'] = pd.Series([15 * i for i in range(len(df_openwhisk))])
    df_cache['elapsed_time'] = pd.Series([15 * i for i in range(len(df_cache))])

    return df_openwhisk, df_cache

# Plot the data
def plot_data(df_openwhisk, df_cache):
    fig, ax = plt.subplots(figsize=(10, 6))

    # Plot OpenWhisk response times
    ow_plot, = ax.plot(df_openwhisk['elapsed_time'], df_openwhisk['timeTaken'], label='OpenWhisk', marker='o', color='#1f77b4')

    # Plot Cache Service response times
    cs_plot, = ax.plot(df_cache['elapsed_time'], df_cache['timeTaken'], label='Cache Service', marker='o', color='green')
    
    # Plot Cold starts
    cold_starts = df_openwhisk[df_openwhisk['isColdStart']]
    cold_start_plot = ax.plot(cold_starts['elapsed_time'], cold_starts['timeTaken'], linestyle='none', marker='o', color='red', label='Cold Start')
    
    # Formatting the plot
    ax.set_title('Response Times Comparison Over Time')
    ax.set_xlabel('Elapsed Time (s)')
    ax.set_ylabel('Response Time (ms)')
    
    # Set x-axis ticks to show exactly 0, 15, 30, etc.
    plt.xticks(np.arange(0, max(df_openwhisk['elapsed_time']) + 15, 15))
    
    handles, labels = ax.get_legend_handles_labels()
    labels.append('Cold Start')
    plt.legend(handles=handles, loc='upper right')
    plt.grid(True)

    # Save and show the plot
    plt.tight_layout()
    plt.savefig('responseTimes_complex_graph.png')
    plt.show()

def main():
    df_openwhisk, df_cache = load_data()
    plot_data(df_openwhisk, df_cache)

if __name__ == '__main__':
    main()



