import csv

# open input and output files
with open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/owid-covid-data.csv', newline='') as input_file, open('C:/Users/benve/Developper/GITHUB/DV-COVID/project/test.csv', 'w', newline='') as output_file:

    # create CSV reader and writer
    reader = csv.DictReader(input_file)
    writer = csv.writer(output_file)

    # write header row
    writer.writerow(['location', 'date', 'handwashing_facilities'])

    #all : set(['Belgium', 'France', 'Germany', 'Italy', 'Luxembourg', 'Netherlands', 'Denmark', 'Ireland', 'Greece', 'Portugal', 'Spain', 'Austria', 'Finland', 'Sweden', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania', 'Malta', 'Poland', 'Czechia', 'Slovakia', 'Slovenia', 'Hungary', 'Bulgaria', 'Romania', 'Croatia'])
    #first wave: set(['Slovakia', 'Greece', 'Croatia', 'Finland', 'Czechia'])
    #second wave: set(['Denmark', 'Ireland', 'Netherlands', 'Finland', 'Belgium'])
    #third wave: set(['Portugal', 'Ireland', 'Netherlands', 'Denmark', 'Belgium'])

    # iterate over each row and write to output file
    countries = set(['Belgium', 'France', 'Germany', 'Italy', 'Luxembourg', 'Netherlands', 'Denmark', 'Ireland', 'Greece', 'Portugal', 'Spain', 'Austria', 'Finland', 'Sweden', 'Cyprus', 'Estonia', 'Latvia', 'Lithuania', 'Malta', 'Poland', 'Czechia', 'Slovakia', 'Slovenia', 'Hungary', 'Bulgaria', 'Romania', 'Croatia'])
    for row in reader:
    #'2020-02-15' <= row['date'] <= '2020-07-20'
    #'2020-07-20' <= row['date'] <= '2021-07-10'
    #'2021-07-10' <= row['date'] <= '2023-02-16'
        if row['location'] in countries and '2021-07-10' <= row['date'] <= '2023-02-16' and row['handwashing_facilities']:
            writer.writerow([row['location'], row['date'], row['handwashing_facilities'],])
