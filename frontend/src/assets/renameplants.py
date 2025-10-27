import os
import re

# this script is formatting my plant svgs. they were named 000-plantname-x. 120 of them. too many to rename
# manually

folder = "./plant-icons"

for filename in os.listdir(folder):
    if filename.endswith(".svg"):
        
        
        # remove leading numbers 000 and -

        old_path = os.path.join(folder, filename)
        print("original name " + filename)
        new_name = filename.lower()

        i = 0
        while new_name[i].isdigit():
            i = i + 1
        
        if new_name[i] == "-":
            i = i + 1
            new_name = new_name[i:]

        print(new_name)
        if (not new_name.endswith("-1.svg") and not new_name.endswith("-2.svg") and not new_name.endswith("-3.svg")):
            new_name = new_name.replace(".svg", "-0.svg")
            
        # save me
        print(new_name)
        new_path = os.path.join(folder, new_name)
        os.rename(old_path, new_path)

    
