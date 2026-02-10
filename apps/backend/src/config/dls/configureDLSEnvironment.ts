import { container } from 'tsyringe';

import { AdminDataSource } from '../../datasources/AdminDataSource';
import { FeatureId } from '../../models/Feature';
import { SettingsId } from '../../models/Settings';
import { setTimezone, setDateTimeFormats } from '../setTimezoneAndFormat';
import { Tokens } from '../Tokens';
import { updateOIDCSettings } from '../updateOIDCSettings';

async function setDLSColourTheme() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  //await db.waitForDBUpgrade();

  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_DARK,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_MAIN,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_LIGHT,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_ACCENT,
    settingsValue: '#000000',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_PRIMARY_CONTRAST,
    settingsValue: '#ffffff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_DARK,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_MAIN,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_LIGHT,
    settingsValue: '#202945',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SECONDARY_CONTRAST,
    settingsValue: '#ffffff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_ERROR_MAIN,
    settingsValue: '#bd0000ff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_SUCCESS_MAIN,
    settingsValue: '#14ac00ff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_WARNING_MAIN,
    settingsValue: '#ceb902ff',
  });
  await db.updateSettings({
    settingsId: SettingsId.PALETTE_INFO_MAIN,
    settingsValue: '#202945',
  });

  await db.updateSettings({
    settingsId: SettingsId.HEADER_LOGO_FILENAME,
    settingsValue: 'diamond-white.svg',
  });
}

async function enableDefaultDLSFeatures() {
  const db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  await db.setFeatures(
    [
      FeatureId.TAGS,
      FeatureId.DATA_ACCESS_USERS,
      FeatureId.STFC_IDLE_TIMER,
      FeatureId.TECHNIQUE_PROPOSALS,
      FeatureId.USER_SEARCH_FILTER,
      FeatureId.CONFLICT_OF_INTEREST_WARNING,
      FeatureId.EMAIL_INVITE,
      FeatureId.INSTRUMENT_MANAGEMENT,
      FeatureId.TECHNICAL_REVIEW,
      FeatureId.USER_MANAGEMENT,
      FeatureId.OAUTH,
      FeatureId.FAP_REVIEW,
      FeatureId.VISIT_MANAGEMENT,
      FeatureId.SHIPPING,
      FeatureId.SCHEDULER,
      FeatureId.RISK_ASSESSMENT,
      FeatureId.EXPERIMENT_SAFETY_REVIEW,
    ],
    true
  );

  await db.setFeatures(
    [FeatureId.EMAIL_SEARCH, FeatureId.EMAIL_INVITE_LEGACY],
    false
  );

  await db.updateSettings({
    settingsId: SettingsId.DISPLAY_PRIVACY_STATEMENT_LINK,
    settingsValue: 'true',
  });

  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER,
    settingsValue: 'ME',
  });

  await db.updateSettings({
    settingsId: SettingsId.DEFAULT_INST_SCI_STATUS_FILTER,
    settingsValue: 'FEASIBILITY_REVIEW',
  });

  await db.updateSettings({
    settingsId: SettingsId.INVITE_VALIDITY_PERIOD_DAYS,
    settingsValue: '365',
  });

  await db.updateSettings({
    settingsId: SettingsId.DISPLAY_FAQ_LINK,
    settingsValue: 'true',
  });
}

export async function configureDLSEnvironment() {
  await setDLSColourTheme();
  await enableDefaultDLSFeatures();
  await setTimezone();
  await setDateTimeFormats();
  await updateOIDCSettings();
}
