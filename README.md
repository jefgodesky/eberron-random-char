# Eberron Random Character Generator

[Live site](https://dragonbetween.net/random/char)

Humans are terrible at randomness, and that 
includes DM's. Left to our own devices at the 
table to come up with random people you might 
encoutner in Eberron, an astute player might 
look back after several sessions and say, 
"Isn't it weird how we meet way more humans 
than the setting material says there should be?
" Or, "Isn't it weird how we meet way fewer 
humans than the setting material says there 
should be?" Or, "everyone is a man?" Or 
"everyone is a woman?"

This is why I keep making random character 
generators for my games: to make sure that the 
NPC's I introduce and the stated diversity of 
the setting reflect one another. The same way 
that a random encounter table helps bring a 
setting to life by making it _actually 
dangerous_ to travel through the areas that 
you were warned might be dangerous, a random 
character generator is a key tool for making 
sure that the random NPC's who show up in your 
game reflect the setting.

## Source data

The generator reads from [a spreadsheet](https://docs.google.com/spreadsheets/d/1n3ggwhEIcPcObjFPmC2XdundQg1eqBXvuDeVzzyWCgU/edit#gid=290721951)
on Google Sheets. I have to admit, I'm pretty 
proud of this. It has over 3,000 traits 
_before_ you start looking at how "trait 
variables" add even more to the mix.

* **Areas** defines the areas that you can 
  select a random character (or characters) from.
  Right now  it's geared towards Sharn, 
  because that's  where my current game is set,
  but we have  everything we need to start 
  expanding it to other areas. These could be
  areas as specific as Sharn, or more general
  areas, like a person randomly selected from the
  population of Khorvaire.
* **Demographics** are slices of your _areas_, 
  showing a combination of race, culture, and 
  religion. This lets you adjust the dials to 
  show, for example, that shifters are a lot 
  less likely to belong to the Church of the 
  Silver Flame, or that a third of Sharn's 
  population is human, or that most humans in 
  Sharn are Brelish. Since most of our source 
  materials break down demographics by race, 
  that comes first, so the _Race %_ column 
  means, "What percent of the area's 
  population does this race represent?" 
  _Culture %_ means, "What percent of the 
  people of this race in this area belong to 
  this culture?" Finally, _Religion %_ means 
  "What percent of the people who belong to 
  this race and culture belong to this 
  religion?" So, the set of _Religion %_ 
  values for each unique combination of race 
  and culture should add up to 100. The 
  _Culture %_ will be repeated across all of 
  the possible religions, so each _unique_ 
  culture listed for a particular race should 
  add up to 100. And likewise, each unique 
  race listed for a particular area should add 
  up to 100. Yeah, it's a little convoluted, 
  but it turned out to be the best way to 
  capture all of the various combinations and 
  make sure that the probabilities worked out 
  and were properly reflected in how 
  characters were generated.
* **Races** lists the possible races that a 
  character might be generated with. The 
  _Alignment_ column is an _influence_, not 
  set in stone. Most races are neutral, 
  meaning they don't influence your alignment 
  at all, but, for example, the differences in 
  literal brain structures between goblins and 
  humans have been brought up in Eberron 
  source books before, so this is reflected by 
  goblins having a lawful neutral influence. 
  See the notes on _Generating Alignment_ 
  below if you're interested more in how this 
  is handled.
* **Cultures** lists the possible cultures 
  that a character might be generated with. 
  The _Eschews Gender_ column marks which 
  cultures reject the gender binary. 
  Characters from these cultures are 
  significantly more likely to be agender, 
  non-binary, or genderfluid. _Religiosity_ is 
  a factor impacting how religious people from 
  these cultures tend to be. Some cultures 
  tend to be rather secular (like the Brelish),
  while others are practically inseparable from 
  particular a religion (like the Tairnadal). 
  The _Preferred religion_ is the most likely 
  religion for members of this culture to 
  adopt, and the _Religiosity_ score impacts 
  how likely this is, but it is always 
  possible for a character to adopt a 
  different religion. See the notes on 
  _Generating Religion_ if you're interested 
  in how this all comes together. The 
  _Alignment_ score for each culture has a lot 
  more variance than the races, because 
  culture impacts such world outlook far more 
  than biology does.
* **Religions** lists the possible religions 
  that a character might be generated with. It 
  lists the names of the religions and what 
  their followers are called. Some religions 
  have race and culture restrictions (for 
  example, the Spirits of the Past will only 
  accept elves, and anyone who follows their 
  religion is, by definition, Tairnadal). 
  Religions, even more than cultures, impact 
  alignment.
* **Dragonmarks** lists the dragonmarked 
  houses, the marks they carry, which races 
  can have those marks, and which races can 
  belong to those houses (since those are 
  _not_ the same thing).
* **Names** provides the major name list for 
  characters. A character's culture determines 
  the name list that she uses, with some 
  special naming rules for certain cultures 
  built into the engine (e.g., Tairnadal and 
  Zil). Generally, though, a character chooses 
  a first name randomly from the list of 
  culturally-appropriate first names, and if 
  there's a list of family names, she chooses 
  a family name randomly from that list. See 
  the notes below on _Generating Names_ if 
  you're interested in how this all comes 
  together. Note that Mror family names assign 
  a character's trait, so if you change the 
  list of Mror family names you'll have to 
  make sure that every family on the list has 
  an ideal on the _Traits_ table.
* **Noble families** lists all of the various 
  noble lines that a character could be 
  generated with. Human and gnome noble 
  families use the _ir'_ prefix, but Mror and 
  Aereni noble families do not, so the 
  _Prefix_ column provides this information. 
  The _Canonical_ column isn't used by the 
  generator, but it helps me keep track of 
  which of these came from an official source, 
  and which ones I made up to create a list of 
  usable length.
* **Traits** lists the traits that a character 
  could be generated with. These generally 
  come in sets, as shown in the _Faction_ 
  column. The _Faction type_ column groups 
  these factions under larger headings 
  (cultures, religions, dragonmarked houses, 
  socio-economic classes, etc.) See the notes 
  below on _Generating Traits_ if you're 
  interested in how these are used. The astute 
  observer will note that most of these traits 
  are found in published _Dungeons & Dragons_ 
  backgrounds, while others are clearly 
  inspired by such traits. That is absolutely 
  true! I'm not taking credit for writing over 
  3,000 unique traits, but rather, packaging 
  traits in a way that expresses the cultures, 
  races, religions, and other factions of Eberron.
* **Trait variables** add a little more 
  variety to traits without making them more 
  common. For example, having a particularly 
  high or low voice isn't any more common than 
  loving animals as a personality trait, but 
  half of such people will have a particularly 
  high voice, and the other half will have a 
  particularly low voice. So we can set the 
  trait to `<VOICEPITCH>` and then add two 
  entries to the trait variables sheet: "I 
  have a particularly high voice." and "I have 
  a particularly low voice." The odds of a 
  character getting the `<VOICEPITCH>` trait 
  is no different than any other, but when 
  it's fully parsed, it might mean a high 
  voice or a low voice. Across all of the 
  traits in the _Traits_ table, we use quite a 
  few of these, with trait variables providing 
  a great deal more diversity (including, in 
  several instances, making sure that rare 
  traits are rare without making them 
  non-existent).
* **Zil families** list the Zil families and 
  which clans they belong to, so that we don't 
  end up contradicting ourselves about which 
  families belong to which clans when we start 
  naming Zil characters. The _Canonical_ 
  column is not used by the generator, it just 
  helps me to keep track of which family-clan 
  associations I was able to pull from an 
  official source, and which I made up to have 
  an appropriately-sized list.
  
## Generating Characters

Of course, any random character generator of 
sufficient complexity is going to build in 
some assumptions about how the world works, 
and this one is no different. So here's the 
assumptions in this codebase.

### Generating Religion

Your religion factors into your alignment, so 
let's talk about that, first.

The character's religion comes from her 
demographic, but does it even matter to her 
very much? I generate 
a _piety_ score for a character by picking a 
random number from a normal distribution (μ=0, 
σ=1), and then adding the cultural influence. 
So, for example, the religiosity of 2 that you 
see with the Tairnadal means that a character 
who would be of average piety in any other 
culture is in the top 97.8% of most religious 
characters in Eberron. That's a huge swing, as 
befits a culture defined by religious devotion.
It's a rare Tairnadal elf indeed for whom 
religion is not a defining aspect.

### Generating Class

By default, 60% of characters generated are 
poor, 30% are middle class, and 10% are rich. 
This is far less inequality than would be 
found in _any_ of the historical societies 
that Eberron harkens back to, but it _does_ do 
a better job of reflecting the sort of NPC's 
people are used to meeting in their games.

### Generating Alignment

I really like [alignment in Eberron](http://keith-baker.com/eberron-flashback-good-and-evil/),
and I definitely wanted to make sure to 
reflect this sort of complexity in my random 
character generator.

I treat both axes (good/evil and 
  lawful/chaotic) as _normal distributions_. 
  The norm is neutral in both cases, and while 
  there are extremes, most people cluster near 
  the center. That makes for a pretty strong 
  bias towards neutral characters.

There are a number of external influences, 
  though.

  * Unlike the real world, Eberron is a world 
    populated by intelligent humanoids with 
    significant biological differences. 
    _Exploring Eberron_ talks a bit about the 
    differences in literal brain structures 
    between goblins and humans, for example, 
    that lead them to a more lawful alignment. 
    So, we have some races that lean towards a 
    given alignment.
  * Your culture probably has the biggest 
    impact on your alignment, so we given each 
    culture an alignment that it skews you 
    towards.
  * If you're pious (meaning your piety is 1.5 x 
    the standard deviation above the mean), then 
    your religion also influences your alignment.
  * With so much research now showing us that 
    [rich people are less ethical](https://www.wired.com/story/why-are-rich-people-so-mean/),
    we also add _lawful evil_ as an external 
    influence if you're rich.
    
So I wrote a function to average two or more 
alignments, which we use to first come up with 
an average external influence by averaging all 
of the external influences together. Then, the 
character's alignment is their random 
predisposition averaged with those external 
influences.

### Generating Names

Let's start with the most common case: any of 
the Five Nations. Aundairian, Brelish, Cyran, 
Karrnathi, and Thranish names all work the 
same way: they have a list of male given names,
a list of female given names, and a list of 
family names. There's also a list of 
occupational family names. So a male 
Brelishman picks a given name randomly from 
the list of male given names. For his family 
name, we combine the list of Brelish family 
names and the list of occupational family 
names, and pick one randomly from that list. 
The women of Breland do the same, except they 
pick from the list of female given names. An 
agender, non-binary, or genderfluid person 
from Breland will first attempt to make an 
_intersection_ of the male and female given 
names lists, to see if there are any names 
that appear on both. If so, they will pick 
from that list. If not, they'll pick from the 
_union_ of the two, a list made by just 
merging both lists together, and then picking 
one from it.

Not every culture works like the Five Nations, 
though. Some have no family names (like the 
Dar). In those cases, a character just picks a 
given name.

Changelings and Tairnadal don't have male and 
female given names, but instead unisex names. 
All characters, regardless of gender, pick 
their names from this same list.

Tairnadal have _ancestors_, and these are 
ultimately pulled from the _Traits_ table. The 
list of available ancestors creates the random 
list of ancestors to pick from. Besides the 
name, a Tairnadal character's traits will be 
drawn from those in the ancestor's set.

Zil have particularly complex names, relying 
on the _Zil family names_ table in the 
spreadsheet. For Zil characters, I choose a 
male or female given name as normal, and then 
randomly select one from the list of clans, 
and then randomly select a family from the 
list of _that clan's_ families.

### Generating Traits

The big idea to this generator ultimately came 
from [Brennan Taylor's](https://www.galileogames.com/)
roleplaying game, _[Bulldogs!](https://geekandsundry.com/bulldogs-is-the-guardians-of-the-galaxy-rpg-youve-been-waiting-for/)_.
This is a game based on _Fate_, so it leans 
heavily on [aspects](https://fate-srd.com/fate-core/aspects-fate-points).
When it comes to playing a character from some 
alien species, though, rather than defining each 
species with a single aspect, _Bulldogs!_ 
provides a _list_ of aspects to choose from. This 
makes the members of a species feel like a 
real group, as they have these aspects in 
common with one another, but it also reflects 
the diversity within the group, as no one is 
quite the same as anyone else. I thought this 
was a brilliant piece of game design that was 
both elegant and expressive, so I wanted to 
build my character generator with a similar 
idea, defining a set of traits shared by 
people of the same culture, people of the same 
race, people of the same religion, people of 
the same socioeconomic class, and so on, with 
each individual being a unique blend of those 
influences in new and interesting ways.

Like names, generating traits is full of 
exceptions, so let's start with the "basic" 
case of someone from the Five Nations.

Let's consider a Brelish human. Not particularly 
religious, not particularly rich, not 
particularly poor, true neutral alignment. For 
_Personality traits_, then, we're combining 
all of the personality traits from the _Any_, 
all of the personality traits from the 
_Brelish_ set, and all of the personality 
traits from the _Human_ set. We pick one at 
random from that list. For _Bonds_ and _Flaws_, 
we're doing much the same.

Some of these traits may use variables, such 
as, "I have a beloved pet `<PET>`." That 
variable, `<PET>`, is replaced by something 
randomly chosen from the _Trait variables_ 
sheet (and you might notice that it repeats 
"cat" and "dog" each quite a few times, 
because these are much more common pets than 
the other creatures on the list).

Ideals get a little trickier, because they 
bring alignment into play. Each of those sets 
— _Any_, _Brelish_, and _Human_ — has a set of 
neutral ideals and a set of any ideals. So we 
combine all of those into a list, and pick one 
from that list. A Neutral Good character would 
pick from any of the good, neutral, or any 
ideals from the _Any_, _Brelish_, or _Human_ 
sets. A Lawful Good character would pick from 
any of the lawful, good, or any ideals from 
any of those sets, and so on.

But there are other sets besides _Any_, 
culture, and race. For particularly religious 
characters, there are sets tied to most of the 
major religions, which are then added to the 
list. For particularly rich or particularly 
poor characters, there are sets tied to those 
socioeconomic classes. For members of 
dragonmarked houses, there are sets for each 
dragonmarked house to be added.

Mror characters aspire to the ideals of their 
family, so rather than choosing an ideal at 
random, the character's family name sets a 
specific ideal (which then sets the 
character's alignment).

Tairnadal characters aspire to personify a 
particular ancestor, so they choose an 
ancestor, and then choose traits from the set 
for that ancestor.