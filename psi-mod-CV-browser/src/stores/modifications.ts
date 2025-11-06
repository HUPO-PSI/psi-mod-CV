import { defineStore } from 'pinia'

export interface ProteinModification {
  id: string
  name: string
  definition: string
}

export const useModificationsStore = defineStore('modifications', {
  state: () => ({
    modifications: [
      {
        id: 'MOD:00046',
        name: 'O-phospho-L-serine',
        definition: 'An L-serine residue that has been post-translationally modified by the attachment of a phosphate group to the side-chain oxygen atom.',
      },
      {
        id: 'MOD:00047',
        name: 'O-phospho-L-threonine',
        definition: 'An L-threonine residue that has been post-translationally modified by the attachment of a phosphate group to the side-chain oxygen atom.',
      },
      {
        id: 'MOD:00048',
        name: 'O-phospho-L-tyrosine',
        definition: 'An L-tyrosine residue that has been post-translationally modified by the attachment of a phosphate group to the side-chain oxygen atom.',
      },
      {
        id: 'MOD:00064',
        name: 'N6-acetyl-L-lysine',
        definition: 'An L-lysine residue that has been post-translationally modified by the acetylation of the side-chain amino group.',
      },
      {
        id: 'MOD:00696',
        name: 'N6-methyl-L-lysine',
        definition: 'An L-lysine residue that has been post-translationally modified by the addition of a methyl group to the side-chain amino group.',
      },
      {
        id: 'MOD:01148',
        name: 'N6,N6-dimethyl-L-lysine',
        definition: 'An L-lysine residue that has been post-translationally modified by the addition of two methyl groups to the side-chain amino group.',
      },
      {
        id: 'MOD:01149',
        name: 'N6,N6,N6-trimethyl-L-lysine',
        definition: 'An L-lysine residue that has been post-translationally modified by the addition of three methyl groups to the side-chain amino group.',
      },
      {
        id: 'MOD:00427',
        name: 'N-formyl-L-methionine',
        definition: 'An L-methionine residue that has been modified by the addition of a formyl group to the N-terminus.',
      },
      {
        id: 'MOD:00089',
        name: 'N6-ubiquitinyl-L-lysine',
        definition: 'An L-lysine residue that has been post-translationally modified by the covalent attachment of ubiquitin to the side-chain amino group.',
      },
      {
        id: 'MOD:00408',
        name: 'N6-succinyl-L-lysine',
        definition: 'An L-lysine residue that has been post-translationally modified by the addition of a succinyl group to the side-chain amino group.',
      },
      {
        id: 'MOD:01914',
        name: 'O-GlcNAc-L-serine',
        definition: 'An L-serine residue that has been post-translationally modified by the attachment of N-acetylglucosamine via a beta linkage to the side-chain oxygen atom.',
      },
      {
        id: 'MOD:01915',
        name: 'O-GlcNAc-L-threonine',
        definition: 'An L-threonine residue that has been post-translationally modified by the attachment of N-acetylglucosamine via a beta linkage to the side-chain oxygen atom.',
      },
      {
        id: 'MOD:00660',
        name: 'omega-N-methyl-L-arginine',
        definition: 'An L-arginine residue that has been post-translationally modified by the addition of a methyl group to one of the terminal nitrogen atoms in the side-chain.',
      },
      {
        id: 'MOD:00078',
        name: 'L-citrulline',
        definition: 'An L-arginine residue that has been deiminated to form L-citrulline.',
      },
      {
        id: 'MOD:00305',
        name: 'S-nitrosyl-L-cysteine',
        definition: 'An L-cysteine residue that has been post-translationally modified by the attachment of a nitric oxide group to the side-chain sulfur atom.',
      },
    ] as ProteinModification[],
  }),
  getters: {
    getAllModifications: (state) => state.modifications,
  },
})
