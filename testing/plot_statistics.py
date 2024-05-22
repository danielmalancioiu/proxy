import json
import matplotlib.pyplot as plt
import numpy as np

def plot_statistics(title):
    with open('testResults-postsFunction-simple.json') as f:
        data = json.load(f)

    openwhisk_stats = data['statistics']['openWhiskStats']
    cache_service_stats = data['statistics']['cacheServiceStats']

    categories = ['Median', '90th Percentile', '95th Percentile', '99th Percentile']
    openwhisk_values = [
        openwhisk_stats['median'],
        openwhisk_stats['percentile90'],
        openwhisk_stats['percentile95'],
        openwhisk_stats['percentile99']
    ]
    cache_service_values = [
        cache_service_stats['median'],
        cache_service_stats['percentile90'],
        cache_service_stats['percentile95'],
        cache_service_stats['percentile99']
    ]

    x = np.arange(len(categories))
    width = 0.35

    plt.figure(figsize=(12, 6))
    plt.bar(x - width/2, openwhisk_values, width, label='Plain OpenWhisk')
    plt.bar(x + width/2, cache_service_values, width, label='Caching Service')

    plt.xlabel('Response Time Categories')
    plt.ylabel('Response Time (ms)')
    plt.title(title)
    plt.xticks(x, categories)
    plt.legend()

    plt.tight_layout()
    plt.savefig('response_times_simple_statistics.png')
    plt.show()


def main():
    plot_statistics('Response Time Statistics for Simple Function')

if __name__ == '__main__':
    main()

# Plot results for simple and complex functions
#plot_statistics('testResults-simpleFunction.json', 'Response Time Statistics for Simple Function')
#plot_statistics('testResults-complexFunction.json', 'Response Time Statistics for Complex Function')
