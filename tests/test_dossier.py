import unittest
from neslab.dossier import dossier, BATTLE_CITY
from neslab.project import inspect
from test_project import runnable_rom


class DossierTests(unittest.TestCase):
    def test_known_profile_is_curated_not_decompiled(self):
        profile=dossier({'sha256':BATTLE_CITY})
        self.assertEqual(profile['title'],'Battle City')
        self.assertIn('nie dekompilacja',profile['source'])
        self.assertTrue(profile['level_example']['available'])
        self.assertFalse(profile['native_port_ready'])

    def test_unknown_rom_does_not_get_game_rules(self):
        report=inspect(runnable_rom())
        self.assertEqual(report['game']['mechanics'],[])
        self.assertFalse(report['game']['level_example']['available'])
        self.assertIn('Niezweryfikowany',report['runtime']['verification'])
