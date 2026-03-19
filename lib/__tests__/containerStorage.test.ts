// Mock localStorage at the module level
const mockStorage: { [key: string]: string } = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

// Mock the global localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage
});

import {
  getSavedContainers,
  saveContainer,
  deleteContainer,
  formatTimeAgo,
  SaveStatus,
} from '@/lib/containerStorage';
import { ContainerRecipe } from '@/components/common';

describe('containerStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('getSavedContainers', () => {
    it('should return empty array when no containers are saved', () => {
      const containers = getSavedContainers();
      expect(containers).toEqual([]);
    });

    it('should return saved containers from localStorage', () => {
      const mockContainers = [
        {
          id: 'test-1',
          name: 'Test Container',
          version: '1.0.0',
          lastModified: Date.now(),
          data: { name: 'Test Container', version: '1.0.0' } as ContainerRecipe,
        },
      ];
      
      mockLocalStorage.setItem('neurocontainers-builder-saved', JSON.stringify(mockContainers));
      
      const containers = getSavedContainers();
      expect(containers).toEqual(mockContainers);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockLocalStorage.setItem('neurocontainers-builder-saved', 'invalid-json');
      
      const containers = getSavedContainers();
      expect(containers).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveContainer', () => {
    it('should save a new container and return its ID', () => {
      const recipe: ContainerRecipe = {
        name: 'Test Container',
        version: '1.0.0',
        categories: ['functional imaging'],
        build: {
          kind: 'neurodocker',
          'base-image': 'ubuntu:22.04',
          'pkg-manager': 'apt',
          directives: [],
        },
        architectures: ['x86_64'],
      };

      const id = saveContainer(recipe);
      
      expect(id).toBeTruthy();
      expect(id).toMatch(/^untitled-\d+$/);
      
      const saved = getSavedContainers();
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Test Container');
      expect(saved[0].version).toBe('1.0.0');
      expect(saved[0].data).toEqual(recipe);
    });

    it('should update existing container when ID is provided', () => {
      const recipe: ContainerRecipe = {
        name: 'Original Name',
        version: '1.0.0',
        categories: ['functional imaging'],
        build: {
          kind: 'neurodocker',
          'base-image': 'ubuntu:22.04',
          'pkg-manager': 'apt',
          directives: [],
        },
        architectures: ['x86_64'],
      };

      const id = saveContainer(recipe);
      
      const updatedRecipe = { ...recipe, name: 'Updated Name' };
      const updatedId = saveContainer(updatedRecipe, id);
      
      expect(updatedId).toBe(id);
      
      const saved = getSavedContainers();
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Updated Name');
    });

    it('should use "Untitled" as display name when name is empty', () => {
      const recipe: ContainerRecipe = {
        name: '',
        version: '1.0.0',
        categories: ['functional imaging'],
        build: {
          kind: 'neurodocker',
          'base-image': 'ubuntu:22.04',
          'pkg-manager': 'apt',
          directives: [],
        },
        architectures: ['x86_64'],
      };

      saveContainer(recipe);
      
      const saved = getSavedContainers();
      expect(saved[0].name).toBe('Untitled');
    });

    it('should limit stored containers to 10', () => {
      // Save 12 containers
      for (let i = 1; i <= 12; i++) {
        const recipe: ContainerRecipe = {
          name: `Container ${i}`,
          version: '1.0.0',
          categories: ['functional imaging'],
          build: {
            kind: 'neurodocker',
            'base-image': 'ubuntu:22.04',
            'pkg-manager': 'apt',
            directives: [],
          },
          architectures: ['x86_64'],
        };
        saveContainer(recipe);
      }
      
      const saved = getSavedContainers();
      expect(saved).toHaveLength(10);
      // Should keep the most recent ones
      expect(saved[0].name).toBe('Container 12');
    });
  });

  describe('deleteContainer', () => {
    it('should remove container from storage', () => {
      const recipe: ContainerRecipe = {
        name: 'Test Container',
        version: '1.0.0',
        categories: ['functional imaging'],
        build: {
          kind: 'neurodocker',
          'base-image': 'ubuntu:22.04',
          'pkg-manager': 'apt',
          directives: [],
        },
        architectures: ['x86_64'],
      };

      const id = saveContainer(recipe);
      expect(getSavedContainers()).toHaveLength(1);
      
      deleteContainer(id);
      expect(getSavedContainers()).toHaveLength(0);
    });

    it('should handle non-existent container gracefully', () => {
      deleteContainer('non-existent-id');
      expect(getSavedContainers()).toHaveLength(0);
    });
  });

  describe('formatTimeAgo', () => {
    const now = Date.now();

    it('should format recent time as "Just now"', () => {
      expect(formatTimeAgo(now)).toBe('Just now');
      expect(formatTimeAgo(now - 30000)).toBe('Just now'); // 30 seconds ago
    });

    it('should format minutes correctly', () => {
      expect(formatTimeAgo(now - 60000)).toBe('1 minute ago'); // 1 minute
      expect(formatTimeAgo(now - 120000)).toBe('2 minutes ago'); // 2 minutes
      expect(formatTimeAgo(now - 1800000)).toBe('30 minutes ago'); // 30 minutes
    });

    it('should format hours correctly', () => {
      expect(formatTimeAgo(now - 3600000)).toBe('1 hour ago'); // 1 hour
      expect(formatTimeAgo(now - 7200000)).toBe('2 hours ago'); // 2 hours
    });

    it('should format days correctly', () => {
      expect(formatTimeAgo(now - 86400000)).toBe('1 day ago'); // 1 day
      expect(formatTimeAgo(now - 172800000)).toBe('2 days ago'); // 2 days
    });
  });

  describe('SaveStatus enum', () => {
    it('should have correct values', () => {
      expect(SaveStatus.Saved).toBe('saved');
      expect(SaveStatus.Saving).toBe('saving');
      expect(SaveStatus.Unsaved).toBe('unsaved');
    });
  });
});
