# every tenth word 1-60,000
# ID	lemma	lemPoS	coll	collPoS	MI	freq	[% coll < node]

import json

with open("collocations.txt", "r") as corpus:
    lines = corpus.readlines()

    wrote = []

    with open("data.csv", "a") as file:
        for line in lines:
            # seperate the data with TAB as the delimiter
            cols = line.split("\t")

            if cols[1] in wrote:
                file.write("," + cols[3] + "," + cols[5] + "\n")
                
            else:
                file.write(cols[1] + "," + cols[3] + "," + cols[5] + "\n")
                
                wrote.append(cols[1])
                