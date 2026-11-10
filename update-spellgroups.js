import XMLBuilder from "fast-xml-builder";
import { XMLParser } from "fast-xml-parser";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const spellTableFile = new URL(
  "./Spellbar Saver/fullspelltable.xml",
  import.meta.url,
);
const groupsFile = new URL("./Spellbar Saver/spellgroups.xml", import.meta.url);

const spellTableXml = readFileSync(spellTableFile);
const spellGroupsXml = readFileSync(groupsFile);
const options = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: true,
};
const parser = new XMLParser(options);

const spellTable = parser.parse(spellTableXml);
const spellGroups = parser.parse(spellGroupsXml);

console.log({ spellTable, spellGroups });

const newGroup = spellGroups.spellgroups.group.map((g) => {
  const firstSpell = g.spell[0];
  const firstSpellId = firstSpell["@_id"];

  //

  const firstSpellInTable = spellTable.ArrayOfSpellInfo.SpellInfo.find(
    (si) => si.Id == firstSpellId,
  );

  if (firstSpell["@_name"] == "Acid Bane I") {
    console.log(JSON.stringify({ firstSpell, firstSpellInTable }));
  }

  const spells = spellTable.ArrayOfSpellInfo.SpellInfo.filter(
    (si) =>
      si.isArc == firstSpellInTable.isArc &&
      si.Family == firstSpellInTable.Family &&
      si.isFellowship == firstSpellInTable.isFellowship &&
      si.isOther == firstSpellInTable.isOther &&
      si.isIrresistible == firstSpellInTable.isIrresistible &&
      si.isCreatureSpellOnly == firstSpellInTable.isCreatureSpellOnly &&
      si.SchoolId == firstSpellInTable.SchoolId,
  );

  return {
    spell: spells.map((si) => {
      return {
        "@_id": `${si.Id}`,
        "@_name": si.FriendlyName || si.Name,
        "@_level": `${si.Level}`,
      };
    }),
  };
});

console.log(spellGroups.spellgroups.group[0], newGroup[0]);

const newSpellGroups = JSON.parse(JSON.stringify(spellGroups));
newSpellGroups.spellgroups.group = newGroup;

const builder = new XMLBuilder({
  ...options,
  format: true,
  suppressEmptyNode: true,
});
const newSpellGroupsXml = builder.build(newSpellGroups);

writeFileSync(groupsFile, newSpellGroupsXml.replaceAll("&apos;", "'"));
