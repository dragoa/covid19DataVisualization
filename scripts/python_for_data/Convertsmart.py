import csv

# Define the set of countries
# all: set(['Belgium', 'France', 'Germany', 'Italy', 'Luxembourg', 'Netherlands', 'Denmark', 'Ireland', 'Greece', 'Portugal', 'Spain', 'Austria', 'Finland', 'Sweden', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania', 'Malta', 'Poland', 'Czechia', 'Slovakia', 'Slovenia', 'Hungary', 'Bulgaria', 'Romania', 'Croatia'])
# first wave: set(['Slovakia', 'Greece', 'Croatia', 'Finland', 'Czechia'])
# second wave: set(['Denmark', 'Ireland', 'Netherlands', 'Finland', 'Belgium'])
# third wave: set(['Portugal', 'Ireland', 'Netherlands', 'Denmark', 'Belgium'])
countries = set(['Belgium', 'France', 'Germany', 'Italy', 'Luxembourg', 'Netherlands', 'Denmark', 'Ireland', 'Greece', 'Portugal', 'Spain', 'Austria', 'Finland', 'Sweden', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania', 'Malta', 'Poland', 'Czechia', 'Slovakia', 'Slovenia', 'Hungary', 'Bulgaria', 'Romania', 'Croatia'])

# Define the date range
start_date = '2020-02-15'
end_date = '2020-07-20'

# open input and output files
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/owid-covid-data.csv', newline='') as input_file, open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/RadarMerge/gdp_vaccination_data0.csv', 'w', newline='') as output_file:

    # create CSV reader and writer
    reader = csv.DictReader(input_file)
    writer = csv.writer(output_file)

    # Write header row including the new fields
    writer.writerow(['location', 'date', 'gdp_per_capita', 'people_vaccinated_per_hundred', 'people_fully_vaccinated_per_hundred'])

    # Initialize a dictionary to keep track of the last non-null values for each country
    last_non_null_values = {}

    # Iterate over each row and update the last non-null values for each country within the date range
    for row in reader:
        location = row['location']
        date = row['date']
        gdp_per_capita = row['gdp_per_capita']
        vaccinated_per_hundred = row['people_vaccinated_per_hundred']
        fully_vaccinated_per_hundred = row['people_fully_vaccinated_per_hundred']

        #'2020-02-15' <= row['date'] <= '2020-07-20'
        #'2020-07-20' <= row['date'] <= '2021-07-10'
        #'2021-07-10' <= row['date'] <= '2023-02-16'
        if location in countries and '2020-02-15' <= row['date'] <= '2020-07-20':
            last_non_null_values[location] = (date, gdp_per_capita, vaccinated_per_hundred, fully_vaccinated_per_hundred)

    # Write the last non-null rows to the output file
    for location, (date, gdp_per_capita, vaccinated_per_hundred, fully_vaccinated_per_hundred) in last_non_null_values.items():
        writer.writerow([location, date, gdp_per_capita, vaccinated_per_hundred, fully_vaccinated_per_hundred])


        
