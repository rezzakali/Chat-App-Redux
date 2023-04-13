const getPartnerInfo = (partnerInfo, loggedInUserEmail) => {
  return partnerInfo.find((partner) => partner.email !== loggedInUserEmail);
};

export default getPartnerInfo;
