# every tenth word 1-60,000
# ID	lemma	lemPoS	coll	collPoS	MI	freq	[% coll < node]

import json

data = {}
with open("collocations.txt", "r") as corpus:
    lines = corpus.readlines()

    current_word = {
        "word": None,
        "colocations": []
    }

    for line in lines:
        # seperate the data with TAB as the delimiter
        cols = line.split("\t")

        curr = cols[1]

        if curr not in data:
            data[curr] = []

        data[curr].append({
            "assoc": cols[3],
            "info": cols[5]
        })

with open("data.json", "w") as file:
    file.write(json.dumps(data))