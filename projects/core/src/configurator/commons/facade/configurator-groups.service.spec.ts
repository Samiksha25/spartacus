import { Type } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { ActiveCartService } from '../../../cart/facade/active-cart.service';
import * as UiActions from '../store/actions/configurator-ui.action';
import { StateWithConfiguration } from '../store/configuration-state';
import { ConfiguratorCommonsService } from './configurator-commons.service';
import { ConfiguratorGroupsService } from './configurator-groups.service';
import { ConfiguratorGroupStatusService } from './configurator-group-status.service';
import { ConfiguratorGroupUtilsService } from '@spartacus/core';
import {
  GROUP_ID_1,
  GROUP_ID_2,
  GROUP_ID_4,
  productConfiguration,
  uiState,
} from './configuration-test-data';

class MockActiveCartService {}

describe('ConfiguratorGroupsService', () => {
  let classUnderTest: ConfiguratorGroupsService;
  let store: Store<StateWithConfiguration>;
  let configuratorCommonsService: ConfiguratorCommonsService;
  let configGroupStatusService: ConfiguratorGroupStatusService;
  let configGroupUtilsService: ConfiguratorGroupUtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        ConfiguratorGroupsService,
        ConfiguratorCommonsService,
        ConfiguratorGroupStatusService,
        ConfiguratorGroupUtilsService,
        {
          provide: ActiveCartService,
          useClass: MockActiveCartService,
        },
      ],
    }).compileComponents();
  }));
  beforeEach(() => {
    classUnderTest = TestBed.inject(
      ConfiguratorGroupsService as Type<ConfiguratorGroupsService>
    );
    store = TestBed.inject(Store as Type<Store<StateWithConfiguration>>);
    configuratorCommonsService = TestBed.inject(
      ConfiguratorCommonsService as Type<ConfiguratorCommonsService>
    );
    configGroupStatusService = TestBed.inject(
      ConfiguratorGroupStatusService as Type<ConfiguratorGroupStatusService>
    );
    configGroupUtilsService = TestBed.inject(
      ConfiguratorGroupUtilsService as Type<ConfiguratorGroupUtilsService>
    );

    spyOn(store, 'dispatch').and.stub();
    spyOn(store, 'pipe').and.returnValue(of(uiState));

    spyOn(configuratorCommonsService, 'setUiState').and.stub();
    spyOn(configGroupStatusService, 'setGroupStatus').and.callThrough();
    spyOn(configGroupStatusService, 'getGroupStatus').and.callThrough();
    spyOn(configGroupStatusService, 'isGroupVisited').and.callThrough();
    spyOn(configGroupUtilsService, 'getParentGroup').and.callThrough();
    spyOn(configGroupUtilsService, 'hasSubGroups').and.callThrough();
  });

  it('should create service', () => {
    spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
      of(productConfiguration)
    );
    expect(classUnderTest).toBeDefined();
  });

  describe('getCurrentGroupId', () => {
    it('should return a current group ID from uiState', () => {
      spyOn(configuratorCommonsService, 'getUiState').and.returnValue(
        of(uiState)
      );
      spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
        of(productConfiguration)
      );
      const currentGroup = classUnderTest.getCurrentGroupId(
        productConfiguration.owner
      );

      expect(currentGroup).toBeDefined();
      currentGroup.subscribe((groupId) => {
        expect(groupId).toBe(GROUP_ID_2);
      });
    });

    it('should return a current group ID from configuration', () => {
      spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
        of(productConfiguration)
      );
      spyOn(configuratorCommonsService, 'getUiState').and.returnValue(of(null));
      const currentGroup = classUnderTest.getCurrentGroupId(
        productConfiguration.owner
      );

      expect(currentGroup).toBeDefined();
      currentGroup.subscribe((groupId) => {
        expect(groupId).toBe(GROUP_ID_1);
      });
    });
  });

  it('should get the parentGroup from uiState', () => {
    spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
      of(productConfiguration)
    );
    spyOn(configuratorCommonsService, 'getUiState').and.returnValue(
      of(uiState)
    );
    const parentGroup = classUnderTest.getMenuParentGroup(
      productConfiguration.owner
    );

    expect(parentGroup).toBeDefined();
    parentGroup.subscribe((group) => {
      expect(group).toBe(productConfiguration.groups[2]);
    });
  });

  describe('getNextGroupId', () => {
    it('should return a next group', () => {
      spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
        of(productConfiguration)
      );
      spyOn(configuratorCommonsService, 'getUiState').and.returnValue(
        of(uiState)
      );
      const currentGroup = classUnderTest.getNextGroupId(
        productConfiguration.owner
      );

      expect(currentGroup).toBeDefined();
      currentGroup.subscribe((groupId) => {
        expect(groupId).toBe(GROUP_ID_4);
      });
    });
  });

  describe('getPreviousGroupId', () => {
    it('should return null', () => {
      spyOn(configuratorCommonsService, 'getUiState').and.returnValue(
        of(undefined)
      );
      spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
        of(undefined)
      );
      const currentGroup = classUnderTest.getPreviousGroupId(
        productConfiguration.owner
      );

      expect(currentGroup).toBeDefined();
      currentGroup.subscribe((groupId) => {
        expect(groupId).toEqual(null);
      });
    });

    it('should return a previous group ID', () => {
      spyOn(configuratorCommonsService, 'getUiState').and.returnValue(
        of(uiState)
      );
      spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
        of(productConfiguration)
      );
      const currentGroup = classUnderTest.getPreviousGroupId(
        productConfiguration.owner
      );

      expect(currentGroup).toBeDefined();
      currentGroup.subscribe((groupId) => {
        expect(groupId).toBe(GROUP_ID_1);
      });
    });
  });

  it('should delegate setting the current group to the store', () => {
    spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
      of(productConfiguration)
    );
    classUnderTest.setCurrentGroup(productConfiguration.owner, GROUP_ID_1);
    const expectedAction = new UiActions.SetCurrentGroup(
      productConfiguration.owner.key,
      GROUP_ID_1
    );
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should delegate setting the parent group to the store', () => {
    spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
      of(productConfiguration)
    );
    classUnderTest.setMenuParentGroup(productConfiguration.owner, GROUP_ID_1);
    const expectedAction = new UiActions.SetMenuParentGroup(
      productConfiguration.owner.key,
      GROUP_ID_1
    );
    expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
  });

  it('should call group status in navigate to different group', () => {
    spyOn(configuratorCommonsService, 'getConfiguration').and.returnValue(
      of(productConfiguration)
    );
    classUnderTest.navigateToGroup(
      productConfiguration,
      productConfiguration.groups[2].id
    );

    expect(configGroupStatusService.setGroupStatus).toHaveBeenCalled();
  });

  it('should check whether isGroupVisited has been called by the configuration group utils service', () => {
    classUnderTest.isGroupVisited(productConfiguration.owner, GROUP_ID_4);
    expect(configGroupStatusService.isGroupVisited).toHaveBeenCalledWith(
      productConfiguration.owner,
      GROUP_ID_4
    );
    expect(configGroupStatusService.isGroupVisited).toHaveBeenCalled();
  });

  it('should check whether getGroupStatus has been called by the configuration group utils service', () => {
    classUnderTest.getGroupStatus(productConfiguration.owner, GROUP_ID_4);
    expect(configGroupStatusService.getGroupStatus).toHaveBeenCalledWith(
      productConfiguration.owner,
      GROUP_ID_4
    );
    expect(configGroupStatusService.getGroupStatus).toHaveBeenCalled();
  });

  it('should check whether getParentGroup has been called by the configuration group utils service', () => {
    classUnderTest.getParentGroup(
      productConfiguration.groups,
      productConfiguration.groups[2].subGroups[0],
      null
    );
    expect(configGroupUtilsService.getParentGroup).toHaveBeenCalledWith(
      productConfiguration.groups,
      productConfiguration.groups[2].subGroups[0],
      null
    );
    expect(configGroupUtilsService.getParentGroup).toHaveBeenCalled();
  });

  it('should check whether hasSubGroups has been called by the configuration group utils service', () => {
    classUnderTest.hasSubGroups(productConfiguration.groups[2]);
    expect(configGroupUtilsService.hasSubGroups).toHaveBeenCalledWith(
      productConfiguration.groups[2]
    );
    expect(configGroupUtilsService.hasSubGroups).toHaveBeenCalled();
  });
});