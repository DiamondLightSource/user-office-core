import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { CallDataSource } from '../../datasources/CallDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { EventBus } from '../../events/eventBus';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export async function dlsEmailHandler(event: ApplicationEvent) {
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const callDataSource = container.resolve<CallDataSource>(
    Tokens.CallDataSource
  );

  //test for null
  if (event.isRejection) {
    return;
  }

  const mailService = container.resolve<MailService>(Tokens.MailService);
  const eventBus = container.resolve<EventBus<ApplicationEvent>>(
    Tokens.EventBus
  );
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );

  switch (event.type) {
    case Event.PROPOSAL_SUBMITTED: {
      const principalInvestigator = await userDataSource.getUser(
        event.proposal.proposerId
      );
      const participants = await userDataSource.getProposalUsersFull(
        event.proposal.primaryKey
      );
      const call = await callDataSource.getCall(event.proposal.callId);

      const workflow = await callDataSource.getProposalWorkflowByCall(
        event.proposal.callId
      );

      if (!principalInvestigator) {
        return;
      }

      const options: EmailSettings = {
        content: {
          template_id: 'proposal-submitted',
        },
        substitution_data: {
          name: '',
          proposal: {
            title: event.proposal.title,
            ref_num: event.proposal.proposalId,
            submitted_on: event.proposal.submittedDate!.toLocaleString(),
            access_route: workflow?.name || 'N/A',
            principal_investigator:
              principalInvestigator.preferredname +
              ' ' +
              principalInvestigator.lastname,
            establishment: principalInvestigator.institution,
            alternative_contacts: '',
            coinvestigators: participants.map(
              (partipant) => `${partipant.preferredname} ${partipant.lastname} `
            ),
            requested:
              'MX: Macromolecular Crystallography I03, I04, I04-1 (1 shifts)', // Need to find out what this string is made up of (call instruments and their shifts?)
          },
          allocation_period: 'Sept 2026 - Mar 2027', // Need to find out where to get this
          deadline: call?.endCall,
        },
        recipients: [],
      };

      for (const participant of participants) {
        if (!participant.email) {
          logger.logError(
            'Could not send email on proposal submission: participant has no email',
            { participant, event }
          );

          return;
        }

        (options.substitution_data as any).name = participant.preferredname;
        options.recipients = [
          {
            address: participant.email,
          },
        ];

        mailService
          .sendMail(options)
          .then((res: any) => {
            logger.logInfo('Emails sent on proposal submission:', {
              result: res,
              event,
            });
          })
          .catch((err: string) => {
            logger.logError('Could not send email(s) on proposal submission:', {
              error: err,
              event,
            });
          });
      }

      return;
    }
    case Event.PROPOSAL_CO_PROPOSER_INVITES_UPDATED: {
      const templateId = 'co-proposer-invite';
      const invites = event.array;

      for (const invite of invites) {
        if (invite.isEmailSent) {
          continue;
        }
        const inviter = await userDataSource.getBasicUserInfo(
          invite.createdByUserId
        );

        if (!inviter) {
          logger.logError('No inviter found when trying to send email', {
            inviter,
            event,
          });

          return;
        }

        const options: EmailSettings = {
          content: {
            template_id: templateId,
          },
          substitution_data: {
            sender: inviter.preferredname + ' ' + inviter.lastname,
          },
          recipients: [{ address: invite.email }],
        };

        mailService
          .sendMail(options)
          .then(async (res: any) => {
            logger.logInfo('Emails sent on proposal invite:', {
              result: res,
              event,
            });

            await inviteDataSource.update({
              id: invite.id,
              isEmailSent: true,
              templateId: templateId,
            });

            await eventBus.publish({
              ...event,
              type: Event.PROPOSAL_CO_PROPOSER_INVITE_SENT,
              invite,
            });
          })
          .catch((err: string) => {
            logger.logError('Could not send email(s) on proposal invite:', {
              error: err,
              event,
            });
          });
      }
      break;
    }
  }
}
