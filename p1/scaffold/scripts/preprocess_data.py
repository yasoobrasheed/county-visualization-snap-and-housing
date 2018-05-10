import json

## Open both data files

with open('../app/data/snap_data.csv') as snap:
	snap_csv = snap.readlines()
	snap_csv = [x.strip() for x in snap_csv]

with open('../app/data/housing_data.csv') as hud:
	hud_csv = hud.readlines()
	hud_csv = [x.strip() for x in hud_csv]


## Preprocessing for snap data

## remove heading

snap_csv.pop(0)

## populate snap data into python dict

snap_data = {}

for line in snap_csv:

	values = line.split(',')

	state = values[0].lower()
	state = state[1:len(state) - 1]

	county = values[1]
	county = county.lower()
	county = county[1:len(county) - 1]

	state_county = state + '-' + county
	
	snap_percentage = values[3]
	snap_percentage = snap_percentage[1:len(snap_percentage) - 1]

	snap_data[state_county] = [float(snap_percentage) * 100]

# Preprocessing for housing data

## remove heading

hud_csv.pop(0)

## populate hud data into dict

snap_hud_data = {}

for line in hud_csv:
	values = line.split(',')
	county_id = values[1]
	county = values[3]
	county = county.lower()
	state = values[24].lower()
	state_county = state + '-' + county
	housing_figure = float(-1)
	if state_county in snap_data:
		if values[31]:
			housing_figure = float(values[31])
		elif values[18]:
			housing_figure = float(values[18])
		data = snap_data[state_county]
		data.append(housing_figure)
		snap_hud_data[county_id] = data
	else:
		##missing SNAP county data
	  	print(state_county)

## write snap/hud data to json

with open('stats.json', 'w') as fp:
    json.dump(snap_hud_data, fp)

fp.close()
