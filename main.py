#!flask/bin/python
from flask import Flask, render_template, request, make_response, url_for, abort, session
import os
import sys
import json
import random
import pandas as pd

app = Flask(__name__)

# read in data
def makedata(filelist):

    dict = {}
    print(filelist)
    for file in filelist:
        with open(file) as data_file:
            data = json.load(data_file)
        dict[file] = data
    return dict

def import_json(json_filepath):
    with open(json_filepath, "r") as json_file:
        data = json.load(json_file)

        return data
    return ""

# default route
@app.route('/')
def index():
    return render_template('taxonomy.html', data=json.dumps(makedata({'Alice00.json', 'Bob00.json', 'Alice01.json', 'Bob01.json', 'Alice03.json', 'Bob03.json', 'Alice06.json', 'Bob06.json', 'Alice08.json', 'Bob08.json', 'Alice34.json', 'Bob34.json'})))


# default route
@app.route('/taxonomy')
def taxanomy():
    return render_template('taxonomy.html', data=json.dumps(makedata({'Alice00.json', 'Bob00.json', 'Alice01.json', 'Bob01.json', 'Alice03.json', 'Bob03.json', 'Alice06.json', 'Bob06.json', 'Alice08.json', 'Bob08.json', 'Alice34.json', 'Bob34.json'})))


# default route
@app.route('/seed_classification')
def seed_classification():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    file = dir_path + "/static/seed2.json"
    return render_template('seed_classification.html', data=json.dumps(import_json(file)))

# default route
@app.route('/kegg_classification')
def kegg_classification():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    file = dir_path + "/static/kegg.json"
    return render_template('kegg_classification.html', data=json.dumps(import_json(file)))


if __name__ == '__main__':
    # main()
    app.run(debug=True)
