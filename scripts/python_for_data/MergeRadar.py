import csv

# Open the first CSV file for reading
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/RadarMerge/gdp_vaccination_data2.csv', 'r') as file1:
    # Read the header line
    header1 = file1.readline().strip().split(',')
    
    # Create a dictionary to store data from the first file
    data1 = {}
    for line in file1:
        parts = line.strip().split(',')
        location = parts[0]
        data1[location] = parts[1:]

# Open the second CSV file for reading
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/RadarMerge/map_stringencies3.csv', 'r') as file2:
    # Read the header line
    header2 = file2.readline().strip().split(',')
    
    # Create a dictionary to store data from the second file
    data2 = {}
    for line in file2:
        parts = line.strip().split(',')
        location = parts[0]
        data2[location] = parts[1:]

# Merge the data based on the 'location' column
merged_data = {}
for location in data1.keys() & data2.keys():
    merged_data[location] = data1[location] + data2[location]

# Write the merged data to a new CSV file
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/RadarMerge/FinalMap3.csv', 'w') as output_file:
    # Write the header line
    output_file.write(','.join(header1 + header2) + '\n')
    
    # Write the merged data
    for location, values in merged_data.items():
        output_file.write(f'{location},{",".join(values)}\n')