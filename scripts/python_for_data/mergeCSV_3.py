import csv
from collections import defaultdict

# Initialize dictionaries to store cumulative values and counts for each location
stringency_totals = defaultdict(float)
containment_totals = defaultdict(float)
count = defaultdict(int)

# Read the first CSV file
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/graph2All_3_1.csv', 'r') as file1:
    reader = csv.DictReader(file1)
    for row in reader:
        location = row['location']
        stringency_index = float(row['stringency_index'])
        stringency_totals[location] += stringency_index
        count[location] += 1

# Read the second CSV file
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/graph2All_3_2.csv', 'r') as file2:
    reader = csv.DictReader(file2)
    for row in reader:
        location = row['location']
        containment_index = float(row['containment_index'])
        containment_totals[location] += containment_index

# Calculate averages and store them in a dictionary
averages = {}
for location in count:
    average_stringency = stringency_totals[location] / count[location]
    average_containment = containment_totals[location] / count[location]
    averages[location] = (average_stringency, average_containment)

# Write the results to a new CSV file
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/map_stringencies3.csv', 'w', newline='') as output_file:
    fieldnames = ['location', 'average_stringency_index', 'average_containment_index']
    writer = csv.DictWriter(output_file, fieldnames=fieldnames)
    writer.writeheader()
    for location, (avg_stringency, avg_containment) in averages.items():
        writer.writerow({'location': location, 'average_stringency_index': avg_stringency, 'average_containment_index': avg_containment})

print("Merged data saved to 'map_stringencies3.csv'")
