#!/bin/bash

# Number of invocations
NUM_INVOCATIONS=100

# OpenWhisk action name
ACTION_NAME="fib"

# OpenWhisk namespace (if needed, otherwise default namespace will be used)
NAMESPACE="your_namespace"

# OpenWhisk CLI command (adjust the path if necessary)
WSK_CLI="wsk"

# Check if WSK_CLI is available
if ! command -v $WSK_CLI &> /dev/null
then
    echo "$WSK_CLI could not be found"
    exit
fi

# Loop to invoke the action
for i in $(seq 1 $NUM_INVOCATIONS)
do
   RANDOM_NUMBER=$i
   echo "Invoking action $ACTION_NAME - Attempt $i"
   $WSK_CLI action invoke $ACTION_NAME --param n $RANDOM_NUMBER --result --blocking
   sleep 0.1  # Adjust the sleep time as necessary
done

echo "Completed $NUM_INVOCATIONS invocations of action $ACTION_NAME."


# #!/bin/bash

# # Check if the function name is passed as an argument


# # Function name from the first argument
# FUNCTION_NAME="api/fib"

# # Base URL
# BASE_URL="http://host.docker.internal:3000/$FUNCTION_NAME"

# # Loop to invoke the function 100 times
# for i in $(seq 1 100)
# do
#    RANDOM_NUMBER=11
#    echo "Invoking function $FUNCTION_NAME - Attempt $i with parameter n=$RANDOM_NUMBER"
#    curl -X GET "$BASE_URL?n=11"
#    sleep 0.1  # Adjust the sleep time as necessary
# done

# echo "Completed 100 invocations of function $FUNCTION_NAME."
